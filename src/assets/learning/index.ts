/**
 * Learning resource thumbnail paths. Serve from public/image/learning/.
 */
export const thumbnails = {
  learning401k: "/image/learning/learning-dashboard.png",
  learningInvestment: "/image/learning/learning-writing.png",
  learningMatch: "/image/learning/learning-dashboard.png",
} as const;

/**
 * Shared learning resources - used by both pre-enrollment (Dashboard) and post-enrollment (LearningHub).
 */
export interface SharedLearningResource {
  id: string;
  title: string;
  subtitle: string;
  badge: "Video" | "Article";
  imageSrc: string;
}

export const SHARED_LEARNING_RESOURCES: SharedLearningResource[] = [
  { id: "1", title: "Understanding 401(k) Basics", subtitle: "Retirement Education Hub", badge: "Video", imageSrc: thumbnails.learning401k },
  { id: "2", title: "Investment Strategies for Retirement", subtitle: "Financial Planning Institute", badge: "Article", imageSrc: thumbnails.learningInvestment },
  { id: "3", title: "Maximizing Your Employer Match", subtitle: "Retirement Education Hub", badge: "Video", imageSrc: thumbnails.learningMatch },
  { id: "4", title: "Roth vs Traditional: Which is Right?", subtitle: "Financial Planning Institute", badge: "Article", imageSrc: thumbnails.learningInvestment },
];
