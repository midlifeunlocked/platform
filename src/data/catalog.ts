/**
 * Sample catalogue data for the public site (Phase 1).
 *
 * This is presentation data wired to real MU thumbnails/instructors so the
 * pages render meaningfully before a backend exists. In Phase 3 it's replaced
 * by Supabase queries; access ('free' | 'premium') becomes a real entitlement
 * check via the abstraction layer. Pages import from here, never inline data.
 */

export interface Instructor {
  slug: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  specialties: string[];
}

export interface Category {
  name: string;
  slug: string;
  blurb: string;
}

export interface Lesson {
  slug: string;
  title: string;
  category: string;
  instructorSlug: string;
  thumbnail: string;
  duration: string;
  access: 'free' | 'premium';
  description: string;
}

export const instructors: Instructor[] = [
  {
    slug: 'lee-lambert',
    name: 'Lee Lambert',
    role: 'Confidence & Mindset',
    photo: '/instructors/lee-lambert.png',
    bio: 'Coach and founder who has spent over a decade helping men rebuild confidence and presence after major life change. Lee teaches the inner game — frame, mindset, and the quiet self-respect that everything else is built on.',
    specialties: ['Confidence', 'Masculinity'],
  },
  {
    slug: 'aidan-lee',
    name: 'Aidan Lee',
    role: 'Image & Dating',
    photo: '/instructors/aidan-lee.png',
    bio: 'Image consultant and dating coach. Aidan shows men over 40 how to dress for their body and stage of life, make a head-turning first impression, and translate that into real-world dating results — without gimmicks.',
    specialties: ['Image & Style', 'Dating & Attraction'],
  },
  {
    slug: 'gav-gillibrand',
    name: 'Gav Gillibrand',
    role: 'Attraction & Body Language',
    photo: '/instructors/gav-gillibrand.jpg',
    bio: 'Attraction and body-language specialist. Gav breaks down the signals that make a man magnetic — posture, presence, and the subtle communication that lands long before a word is spoken.',
    specialties: ['Body Language', 'Dating & Attraction'],
  },
];

export const categories: Category[] = [
  { name: 'Confidence', slug: 'confidence', blurb: 'Rebuild self-respect and unshakeable presence.' },
  { name: 'Dating & Attraction', slug: 'dating-attraction', blurb: 'Meet, attract, and connect — the modern way.' },
  { name: 'Image & Style', slug: 'image-style', blurb: 'Dress and present like the man you are becoming.' },
  { name: 'Masculinity', slug: 'masculinity', blurb: 'Grounded, mature masculinity for the second chapter.' },
  { name: 'Body Language', slug: 'body-language', blurb: 'Communicate strength before you say a word.' },
  { name: 'Business', slug: 'business', blurb: 'Earn, lead, and build the life you want next.' },
];

export const lessons: Lesson[] = [
  { slug: '5-steps-to-command-confidence', title: '5 Steps to Command Confidence', category: 'Confidence', instructorSlug: 'lee-lambert', thumbnail: '/thumbnails/5-steps-to-command-confidence.png', duration: '14 min', access: 'free', description: 'A practical, five-step framework for walking into any room grounded and self-assured — starting today.' },
  { slug: 'make-a-head-turning-first-impression', title: 'Make a Head-Turning First Impression', category: 'Image & Style', instructorSlug: 'aidan-lee', thumbnail: '/thumbnails/make-a-head-turning-first-impression.png', duration: '11 min', access: 'free', description: 'The handful of details that decide how you are read in the first seven seconds — and how to get them right.' },
  { slug: 'read-the-room-body-language', title: 'Read the Room: Body Language', category: 'Body Language', instructorSlug: 'gav-gillibrand', thumbnail: '/thumbnails/body-language.png', duration: '17 min', access: 'free', description: 'Learn to read a room and project calm authority with posture, eye contact, and deliberate stillness.' },
  { slug: 'the-maturity-edge', title: 'The Maturity Edge', category: 'Masculinity', instructorSlug: 'lee-lambert', thumbnail: '/thumbnails/maturity.png', duration: '12 min', access: 'free', description: 'Why your age is an asset, not a liability — and how to lead with the maturity younger men can’t fake.' },
  { slug: 'outcome-independence', title: 'Outcome Independence', category: 'Masculinity', instructorSlug: 'lee-lambert', thumbnail: '/thumbnails/outcome-independence.png', duration: '28 min', access: 'premium', description: 'The mindset shift that makes you magnetic: caring deeply while being unattached to any single result.' },
  { slug: 'get-more-matches-on-dating-apps', title: 'Get More Matches on Dating Apps', category: 'Dating & Attraction', instructorSlug: 'aidan-lee', thumbnail: '/thumbnails/get-more-matches-on-dating-apps.png', duration: '22 min', access: 'premium', description: 'Profile, photos, and openers that work for men over 40 — a repeatable system, not luck.' },
  { slug: 'make-her-fall-for-you', title: 'Make Her Fall For You', category: 'Dating & Attraction', instructorSlug: 'gav-gillibrand', thumbnail: '/thumbnails/make-her-fall-for-you.png', duration: '31 min', access: 'premium', description: 'Build genuine attraction and emotional connection that lasts beyond the first few dates.' },
  { slug: 'get-noticed-by-your-ideal-woman', title: 'Get Noticed by Your Ideal Woman', category: 'Dating & Attraction', instructorSlug: 'aidan-lee', thumbnail: '/thumbnails/get-noticed-by-your-ideal-woman.png', duration: '19 min', access: 'premium', description: 'Position yourself so the right woman notices you — clarity on who you want and how to be seen.' },
  { slug: 'command-real-confidence', title: 'Command Real Confidence', category: 'Confidence', instructorSlug: 'lee-lambert', thumbnail: '/thumbnails/confidence.png', duration: '24 min', access: 'premium', description: 'Go deeper than tactics: build the durable, lived-in confidence that holds up under pressure.' },
  { slug: 'build-social-status', title: 'Build Unshakeable Social Status', category: 'Business', instructorSlug: 'gav-gillibrand', thumbnail: '/thumbnails/social-status.png', duration: '26 min', access: 'premium', description: 'Earn real status through value and leadership — the kind that opens doors in work and life.' },
  { slug: 'train-smarter', title: 'Train Smarter, Not Harder', category: 'Business', instructorSlug: 'lee-lambert', thumbnail: '/thumbnails/5-ways-to-train-smarter.png', duration: '16 min', access: 'premium', description: 'Five ways to get stronger and leaner after 40 with less time and far less wear on your body.' },
  { slug: 'the-masculine-frame', title: 'The Masculine Frame', category: 'Masculinity', instructorSlug: 'gav-gillibrand', thumbnail: '/thumbnails/masculinity.png', duration: '21 min', access: 'premium', description: 'Hold your frame under social pressure — the centred, unreactive presence that draws people in.' },
];

// ---- helpers ----------------------------------------------------------------

export const getInstructor = (slug: string): Instructor | undefined =>
  instructors.find((i) => i.slug === slug);

/** Map a Lesson to the props a <LessonCard> expects (resolves instructor + href). */
export interface LessonCardProps {
  title: string;
  category: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  access: 'free' | 'premium';
  href: string;
}
export const toCardProps = (l: Lesson): LessonCardProps => ({
  title: l.title,
  category: l.category,
  instructor: getInstructor(l.instructorSlug)?.name ?? '',
  thumbnail: l.thumbnail,
  duration: l.duration,
  access: l.access,
  href: `/lessons/${l.slug}`,
});

export const lessonsByCategory = (categoryName: string): Lesson[] =>
  lessons.filter((l) => l.category === categoryName);

export const categoryCount = (categoryName: string): number =>
  lessonsByCategory(categoryName).length;

export const freeLessons = (): Lesson[] => lessons.filter((l) => l.access === 'free');
export const premiumLessons = (): Lesson[] => lessons.filter((l) => l.access === 'premium');

export const relatedLessons = (lesson: Lesson, limit = 3): Lesson[] =>
  lessons
    .filter((l) => l.slug !== lesson.slug && l.category === lesson.category)
    .concat(lessons.filter((l) => l.slug !== lesson.slug && l.category !== lesson.category))
    .slice(0, limit);
