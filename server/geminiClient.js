/**
 * Gemini Client — Initializes the Google Generative AI model.
 * API key comes from environment variable only. Never expose to frontend.
 *
 * dotenv.config() is called here to ensure env vars are loaded before
 * reading GEMINI_API_KEY, regardless of import order in the main server.
 */

import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY not set. Core AI Gemini features will be disabled."
  );
}

let model = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
}

export { model };
