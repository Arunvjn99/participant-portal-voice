export interface Advisor {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface LearningResource {
  id: string;
  title: string;
  duration: string;
  category: string;
  thumbnail: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}
