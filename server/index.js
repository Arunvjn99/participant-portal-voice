/**
 * Participant Portal API Server
 * Secure backend proxy for:
 *  - Core AI (Gemini) — Scoped retirement assistant
 *  - Google Speech-to-Text and Text-to-Speech
 * API keys are stored in environment variables only
 */

import express from "express";
import cors from "cors";
import multer from "multer";
import { SpeechClient } from "@google-cloud/speech";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import dotenv from "dotenv";
import { generateCoreReply } from "./coreAiController.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Initialize Google Cloud clients
let speechClient;
let ttsClient;

try {
  // Google Cloud credentials from environment variable
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
    : null;

  if (credentials) {
    speechClient = new SpeechClient({ credentials });
    ttsClient = new TextToSpeechClient({ credentials });
  } else {
    console.warn("Google Cloud credentials not found. Voice features will be disabled.");
  }
} catch (error) {
  console.error("Error initializing Google Cloud clients:", error);
}

/**
 * POST /api/voice/stt
 * Speech-to-Text endpoint
 */
app.post("/api/voice/stt", upload.single("audio"), async (req, res) => {
  try {
    if (!speechClient) {
      return res.status(503).json({
        error: "Speech-to-Text service unavailable",
        message: "Google Cloud credentials not configured",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No audio file provided",
      });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype || "audio/webm";

    // Configure recognition request
    const request = {
      audio: {
        content: audioBuffer.toString("base64"),
      },
      config: {
        encoding: mimeType.includes("webm") ? "WEBM_OPUS" : mimeType.includes("wav") ? "LINEAR16" : "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "en-US",
        model: "latest_short",
        enableAutomaticPunctuation: true,
        useEnhanced: true,
      },
    };

    // Call Google Speech-to-Text API
    const [response] = await speechClient.recognize(request);

    if (!response.results || response.results.length === 0) {
      return res.status(200).json({
        transcript: "",
        confidence: 0,
        error: "No speech detected",
      });
    }

    const result = response.results[0];
    const alternative = result.alternatives[0];

    // Do NOT log raw audio or transcript content
    // Return transcript only
    res.json({
      transcript: alternative.transcript || "",
      confidence: alternative.confidence || 0,
    });
  } catch (error) {
    console.error("STT Error:", error.message);
    res.status(500).json({
      error: "Speech-to-Text failed",
      message: "I couldn't hear that clearly. You can try again or type instead.",
    });
  }
});

/**
 * POST /api/voice/tts
 * Text-to-Speech endpoint
 */
app.post("/api/voice/tts", async (req, res) => {
  try {
    if (!ttsClient) {
      return res.status(503).json({
        error: "Text-to-Speech service unavailable",
        message: "Google Cloud credentials not configured",
      });
    }

    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "No text provided",
      });
    }

    // Sanitize text - never speak sensitive data
    const sanitizedText = sanitizeTextForTTS(text);

    // Configure TTS request
    const request = {
      input: { text: sanitizedText },
      voice: {
        languageCode: "en-US",
        name: "en-US-Neural2-D", // Neutral, calm voice
        ssmlGender: "NEUTRAL",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.95, // Slightly slower, calmer pace
        pitch: 0,
        volumeGainDb: 0,
      },
    };

    // Call Google Text-to-Speech API
    const [response] = await ttsClient.synthesizeSpeech(request);

    if (!response.audioContent) {
      return res.status(500).json({
        error: "Text-to-Speech failed",
        message: "Could not generate audio",
      });
    }

    // Return audio buffer
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", response.audioContent.length);
    res.send(Buffer.from(response.audioContent, "base64"));
  } catch (error) {
    console.error("TTS Error:", error.message);
    res.status(500).json({
      error: "Text-to-Speech failed",
      message: "Could not generate speech audio",
    });
  }
});

/**
 * Sanitize text for TTS - mask sensitive data
 */
function sanitizeTextForTTS(text) {
  // Mask SSN patterns (XXX-XX-XXXX)
  let sanitized = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "XXX-XX-XXXX");
  
  // Mask bank account numbers (last 4 digits only)
  sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, (match) => {
    return `XXXX-XXXX-XXXX-${match.slice(-4)}`;
  });

  // Mask routing numbers
  sanitized = sanitized.replace(/\b\d{9}\b/g, "XXXX-XXXX-X");

  return sanitized;
}

/**
 * POST /api/core-ai
 * Core AI — Scoped retirement assistant powered by Gemini
 * Validates topic scope before calling Gemini API
 */
app.post("/api/core-ai", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        error: "No message provided",
      });
    }

    const result = await generateCoreReply(message.trim(), context || {});

    res.json({
      reply: result.reply,
      filtered: result.filtered || false,
    });
  } catch (error) {
    console.error("Core AI Error:", error.message);
    res.status(500).json({
      error: "AI response failed",
      reply: "I'm having trouble right now. Please try again in a moment.",
    });
  }
});

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    services: {
      stt: !!speechClient,
      tts: !!ttsClient,
      coreAi: !!process.env.GEMINI_API_KEY,
    },
  });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
  console.log(`Core AI (Gemini): ${!!process.env.GEMINI_API_KEY ? "enabled" : "disabled (set GEMINI_API_KEY)"}`);
  console.log(`STT available: ${!!speechClient}`);
  console.log(`TTS available: ${!!ttsClient}`);
});
