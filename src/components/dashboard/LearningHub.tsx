import { useState } from "react";
import type { LearningResource } from "../../data/enrollmentSummary";
import { SHARED_LEARNING_RESOURCES } from "../../assets/learning";

const DEFAULT_ITEMS: LearningResource[] = SHARED_LEARNING_RESOURCES.map((r) => ({
  id: r.id,
  title: r.title,
  badge: r.badge,
  imageSrc: r.imageSrc,
  subtitle: r.subtitle,
}));

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect fill='%e2e8f0' width='320' height='180'/%3E%3Ctext fill='%94a3b8' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EThumbnail%3C/text%3E%3C/svg%3E";

interface LearningHubProps {
  items?: LearningResource[];
}

function LearningHubCard({ item }: { item: LearningResource }) {
  const [imgError, setImgError] = useState(false);
  const src = imgError || !item.imageSrc ? PLACEHOLDER_IMAGE : item.imageSrc;

  return (
    <div className="ped-learning__card">
      <div className="ped-learning__card-thumb">
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setImgError(true)} />
      </div>
      <span className="ped-learning__card-badge">{item.badge}</span>
      <span className="ped-learning__card-title">{item.title}</span>
    </div>
  );
}

export const LearningHub = ({ items = DEFAULT_ITEMS }: LearningHubProps) => (
  <article className="ped-learning bg-card rounded-xl border border-border p-6 shadow-sm min-h-fit w-full min-w-0">
    <h2 className="ped-learning__title text-foreground">Learning Resources</h2>
    <div className="ped-learning__scroll">
      {items.map((item) => (
        <LearningHubCard key={item.id} item={item} />
      ))}
      <span className="ped-learning__scroll-arrow" aria-hidden>→</span>
    </div>
  </article>
);
