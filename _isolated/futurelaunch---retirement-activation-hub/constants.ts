import { Advisor, LearningResource } from './types';

export const ADVISORS: Advisor[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Financial Wellness Guide',
    bio: 'I help people translate their life goals into financial plans. Coffee enthusiast.',
    image: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    role: 'Retirement Strategist',
    bio: 'Specializing in sustainable investing and long-term growth strategies.',
    image: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Plan Specialist',
    bio: 'Here to simplify the complex terms and get you set up in minutes.',
    image: 'https://picsum.photos/200/200?random=3'
  }
];

export const RESOURCES: LearningResource[] = [
  {
    id: '1',
    title: 'The Magic of Compound Interest',
    duration: '2 min read',
    category: 'Basics',
    thumbnail: 'https://picsum.photos/400/300?random=4'
  },
  {
    id: '2',
    title: 'Roth vs. Traditional: A Simple Guide',
    duration: '3 min read',
    category: 'Comparison',
    thumbnail: 'https://picsum.photos/400/300?random=5'
  },
  {
    id: '3',
    title: 'How Much is Enough?',
    duration: '4 min read',
    category: 'Planning',
    thumbnail: 'https://picsum.photos/400/300?random=6'
  },
  {
    id: '4',
    title: 'Sustainable Investing 101',
    duration: '2 min read',
    category: 'Impact',
    thumbnail: 'https://picsum.photos/400/300?random=7'
  }
];

export const SUGGESTION_CHIPS = [
  "Explain 401(k) basics",
  "Compare Roth vs Traditional",
  "How much should I contribute?",
  "What is employer match?"
];
