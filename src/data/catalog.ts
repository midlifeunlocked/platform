/**
 * Catalogue data — AUTO-GENERATED from the Midlife Unlocked Webflow CMS.
 * Source site 6569279d3919dd8878913e07 (Core/Premium/Bonus Lessons, Full
 * Courses, Instructors, Lesson Categories). Regenerate rather than hand-edit.
 *
 * The Webflow catalogue is FROZEN (no further updates), so this file is the
 * canonical source. It was generated once from the CMS; hand-edit going forward.
 *
 * Applied fixes vs. raw CMS: full team-member-bio used for bios (excerpts were
 * thin/placeholder); respect the per-lesson premium flag; re-map the stray
 * Premium "Instant Impressive Image" to Gavin Parker; hide empty categories;
 * Romeo Lewis added by hand as Dean Gladwyn's co-guest (Webflow couldn't model
 * two guests per video).
 *
 * In Phase 3 this is replaced by live Supabase queries; access becomes a real
 * entitlement check via the abstraction layer.
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

export interface Course {
  slug: string;
  name: string;
  category: string;
  instructorSlugs: string[];
}

export interface Lesson {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  instructorSlugs: string[];
  thumbnail: string;
  duration: string;
  access: 'free' | 'premium';
  courseSlug: string | null;
  order: number | null;
  description: string;
}

export const instructors: Instructor[] = [
  { slug: "simon-goldwhite", name: "Simon Goldwhite", role: "Mindset & Masculinity", photo: "/instructors/simon-goldwhite.jpg", specialties: [], bio: "Simon is a certified Executive Coach, a Master NLP Practitioner, and trained in Hypnosis, among other methods. He’s been building businesses for 12 years and has been coaching professionally for 7 years. He co-runs one of the largest men's personal development groups on Facebook. Simon has worked with hundreds of men, from high-level CEOs to everyday guys looking to improve their lives. He leads men's groups and offers online courses aimed at enhancing men's mindset and communication skills, particularly focusing on overcoming 'nice guy syndrome'." },
  { slug: "dean-gladwyn", name: "Dean Gladwyn", role: "Dating & Relationships", photo: "/instructors/dean-gladwyn.jpg", specialties: ["Dating"], bio: "Dean Gladwyn has been teaching men how to overcome shyness and become more attractive to women for over a decade. We will teach you how to create a deep connection with a woman, so that you have the knowledge and power to never feel frustrated or lonely again. Whether you want to meet a great woman for a relationship, have lots of beautiful women in your life, or even get your ex-girlfriend back – Succeed In Dating have the answer to help you reach your full potential. This is something that doesn’t have to happen by chance, and there is a set path that can get you there. We have dedicated more than the last decade to knowing exactly what that path is." },
  { slug: "ty-cutner", name: "Ty Cutner", role: "Mindset & Style", photo: "/instructors/ty-cutner.jpg", specialties: [], bio: "Ty Cutner is a Level 2 trained IFS (Internal Family Systems) -informed image and relationship coach for men. He improved the way he dressed on a daily basis in 2012 and it transformed his life. He started helping friends with their image and they experienced similar career and social advancements instantly. In 2016, he launched his image coaching practice helping professional men gain the social and psychological benefits of a well-dressed man. In 2020, he began helping men move on from divorce, separation or relationships that included infidelity. He’s a co-author in the best-selling psychotherapy book Freeing Self: IFS Beyond the Therapy Room. Ty’s vision is to share the powerful tools of IFS within his personal development programs for men.https://www.tycutner.com/Midlifecheckout" },
  { slug: "dan-lavoie", name: "Dan Lavoie", role: "Masculinity & Confidence", photo: "/instructors/dan-lavoie.jpg", specialties: ["Masculinity"], bio: "I'm coach Dan. I coach men to take their balls back and become the Legendary Alpha they were always meant to be. After years of not feeling like my best self, I went on a journey of self-discovery. My journey started with improving my health and getting licensed as a health coach to help other men do the same. I used the confidence I developed while getting healthy and decided to leave my toxic job and work for myself. This daisy chained to setting boundaries with folks who didn't treat me well and ending some relationships completely. In the end my health is better than ever, I'm in control of my income, and my relationships with my wife and kids have never been better. While I was a health coach, I realized most men needed a lot more than coaching on health and fitness, they needed a coach to help with a complete mindset shift. Looking at men's role in today's society I realized we're all fighting a battle that most men were never equipped for. This is why I shifted from health coaching men to helping them become bulletproof by coaching them to take their balls back. The problem in today's society isn't too much masculinity, it's the exact opposite." },
  { slug: "lee-lambert", name: "Lee Lambert", role: "Founder", photo: "/instructors/lee-lambert.jpeg", specialties: ["Confidence", "Business & Career", "Masculinity"], bio: "Lee Lambert is the founder of Midlife Unlocked video masterclass platform. Married to his high school sweetheart at a young age, Lee never got the chance to establish his own identity as a man. Lacking confidence, boundaries, and control throughout his 18-year marriage, he suffered from emotional abuse. After getting a divorce at age 41, Lee struggled to become his own man. But after going through hundreds of hours of material on masculinity, dating, and confidence, he began to turn his life around. Suffering through years of trial and error, he finally figured out what works and what doesn't for divorced guys over 40. From that experience, Lee made it his mission to help other guys in the same situation to shortcut the process. He started the Midlife Unlocked platform just for divorced men over 40, gathering top experts from every field to provide masterclasses and help them live the life they've fantasized about having all along." },
  { slug: "gavin-parker", name: "Gavin Parker", role: "Image & Style", photo: "/instructors/gavin-parker.png", specialties: ["Image & Style", "Dating"], bio: "Originally from the UK and now living in Budapest, I've spent the last six years immersed in the men's style industry. As a style coach and the owner of a custom clothier, I aim to help men enhance their personal presentation, ensuring they command attention and make memorable first impressions. In my role at Midlife Unlocked, I specifically support men who are rebuilding their lives after divorce. I teach them how to refine their image, enabling them to stand out from the crowd without spending a fortune on fashion. This empowers them to overcome being overlooked, improve their dating prospects, and unlock new opportunities in every aspect of their lives." },
  { slug: "aidan-lee", name: "Aidan Lee", role: "Fitness & Mindset", photo: "/instructors/aidan-lee.png", specialties: ["Fitness & Nutrition"], bio: "For the first 21 years of my life, I thought my path was to become the Kickboxing World Champion, and I was completely absorbed in making this my life goal. I truly believed I could, should, and would be the best there is…One day! But after many years of hard sparring since I was a kid, I was accumulating a fair amount of brain damage, had no money to pay bills, and lived a life filled with the monotony of training all day every day. All just so I could win and bolster my ego through the defeat of another. It wasn’t until I learnt about the importance of using Martial Arts and Philosophy as a tool to live your life as successfully as possible. I started to notice how there wasn’t anything available which really taught me how to link the body and mind together. https://fitroots.co.uk/" },
  { slug: "gav-gillibrand", name: "Gav Gillibrand", role: "Fitness & Nutrition", photo: "/instructors/gav-gillibrand.jpeg", specialties: ["Fitness & Nutrition"], bio: "In the last 4 years, with my coaching biz entirely online, I’ve worked with over 250 men in my coaching programme, helping them to achieve health & weight loss success. Along the way, I’ve honed and toned, crafted and chiselled away to produce what I believe is a truly transformative solution for men with kids, above the age of 40 that want to lose at least 20lbs, feel and look great and boost & maximise their testosterone levels as they get older. And I did it through a process that nobody else is following. While most people are focusing on nutrition and exercise for weight loss - that’s only one SMALL portion of what I help my clients with - and they lose weight sustainably" },
  { slug: "romeo-lewis", name: "Romeo Lewis", role: "Dating", photo: "/instructors/romeo-lewis.jpg", specialties: ["Dating"], bio: "" },
];

export const categories: Category[] = [
  { name: "Masculinity", slug: "masculinity", blurb: "Grounded, mature masculinity for the second chapter." },
  { name: "Business & Career", slug: "business-and-career", blurb: "Earn, lead, and double your opportunities." },
  { name: "Confidence", slug: "confidence", blurb: "Rebuild self-respect and unshakeable presence." },
  { name: "Dating", slug: "dating", blurb: "Meet, attract, and connect — the modern way." },
  { name: "Image & Style", slug: "image-style", blurb: "Dress and present like the man you’re becoming." },
  { name: "Fitness & Nutrition", slug: "fitness-nutrition", blurb: "Get stronger and leaner after 40." },
];

export const courses: Course[] = [
  { slug: "midlife-dating-unlocked", name: "Midlife Dating Unlocked", category: "Dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"] },
  { slug: "instant-impressive-image", name: "Instant Impressive Image", category: "Image & Style", instructorSlugs: ["gavin-parker"] },
  { slug: "midlife-strength-unlocked", name: "Midlife Strength Unlocked", category: "Fitness & Nutrition", instructorSlugs: ["lee-lambert", "aidan-lee"] },
  { slug: "midlife-masculinity-unlocked", name: "Midlife Masculinity Unlocked", category: "Masculinity", instructorSlugs: ["dan-lavoie", "lee-lambert"] },
  { slug: "double-your-job-offers", name: "Double Your Job Offers", category: "Business & Career", instructorSlugs: ["lee-lambert"] },
  { slug: "midlife-confidence-unlocked", name: "Midlife Confidence Unlocked", category: "Confidence", instructorSlugs: ["lee-lambert"] },
];

export const lessons: Lesson[] = [
  { slug: "obstacles-to-confidence", title: "Free Preview: Obstacles to Confidence", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/obstacles-to-confidence.png", duration: "17m 26s", access: "free", courseSlug: null, order: null, description: "Free Preview: Avoid These Confidence Killers At All Costs" },
  { slug: "epic-goals", title: "Free Preview: Goal Setting That Works", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/epic-goals.png", duration: "17m 50s", access: "free", courseSlug: null, order: null, description: "Free Preview of the Goals Workshop: Forget SMART Goals, This Method Actually Works" },
  { slug: "human-interaction-skills", title: "Mastering Human Interaction Skills Introduction", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/human-interaction-skills.png", duration: "3m 45s", access: "free", courseSlug: null, order: null, description: "Introduction To Mastering Human Interaction Skills for Success and Influence" },
  { slug: "double-your-job-offers-intro", title: "Double Your Job Offers Intro", category: "Business & Career", categorySlug: "business-and-career", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/double-your-job-offers-intro.png", duration: "11m 38s", access: "free", courseSlug: null, order: null, description: "How To Stand Out Among Other Candidates And Recruiters, Giving You The Competitive Edge You Need To Land Your Dream Job" },
  { slug: "grab-control", title: "Genuine, Refined, Attractive Behavior Introduction", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/grab-control.png", duration: "12m 24s", access: "free", courseSlug: null, order: null, description: "GRAB Control Intro: How To Become More Attractive While Still Being Yourself" },
  { slug: "chris-haddad-interview", title: "Special Guest Interview: Chris Haddad", category: "Business & Career", categorySlug: "business-and-career", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/chris-haddad-interview.png", duration: "1h 5m", access: "free", courseSlug: null, order: null, description: "Masculinity, Money, Relationships, and More with $750 Million Copywriter Chris Haddad" },
  { slug: "free-preview-masculinity-unlocked-intro", title: "Free Preview: Midlife Masculinity Unlocked - Reclaim Your Masculinity", category: "Masculinity", categorySlug: "masculinity", instructorSlugs: ["dan-lavoie", "lee-lambert"], thumbnail: "/thumbnails/free-preview-masculinity-unlocked-intro.png", duration: "21m 19s", access: "free", courseSlug: null, order: null, description: "Free Preview: The First Step To Being Your Own Man Again After Divorce" },
  { slug: "free-preview-midlife-strength-unlocked-intro", title: "Free Preview: Midlife Strength Unlocked - Transform Your Dad Bod", category: "Fitness & Nutrition", categorySlug: "fitness-nutrition", instructorSlugs: ["aidan-lee", "lee-lambert"], thumbnail: "/thumbnails/free-preview-midlife-strength-unlocked-intro.png", duration: "11m 36s", access: "free", courseSlug: null, order: null, description: "Free Preview: The Counter-Intuitive Way To Transform Your Dad Bod For Guys Over 40" },
  { slug: "free-preview-instant-impressive-image-intro", title: "Free Preview: Instant Impressive Image Intro", category: "Image & Style", categorySlug: "image-style", instructorSlugs: ["gavin-parker"], thumbnail: "/thumbnails/free-preview-instant-impressive-image-intro.png", duration: "11m 12s", access: "free", courseSlug: null, order: null, description: "How To Go From Struggling To Dress Well To Effortlessly Achieving An Impressive Image" },
  { slug: "lose-belly-fat-over-40", title: "Lose Belly Fat Over 40", category: "Fitness & Nutrition", categorySlug: "fitness-nutrition", instructorSlugs: ["gav-gillibrand"], thumbnail: "/thumbnails/lose-belly-fat-over-40.png", duration: "42m 22s", access: "free", courseSlug: null, order: null, description: "For Guys Over 40: Get Rid Of Excess Body Fat Around Your Midsection" },
  { slug: "get-more-matches-on-dating-apps", title: "Get More Matches On Dating Apps", category: "Dating", categorySlug: "dating", instructorSlugs: ["gavin-parker"], thumbnail: "/thumbnails/get-more-matches-on-dating-apps.png", duration: "1h 19m", access: "premium", courseSlug: null, order: null, description: "Getting few responses and matches on dating apps?" },
  { slug: "stop-killing-your-chances-for-a-second-date", title: "Stop Killing Your Chances For a Second Date", category: "Dating", categorySlug: "dating", instructorSlugs: ["gavin-parker"], thumbnail: "/thumbnails/stop-killing-your-chances-for-a-second-date.png", duration: "1h 22m", access: "free", courseSlug: null, order: null, description: "Noticing women pull away after first dates when you try to secure the next date too quickly?" },
  { slug: "no-more-looking-sloppy-unrefined", title: "No More Looking Sloppy and Unrefined", category: "Image & Style", categorySlug: "image-style", instructorSlugs: ["gavin-parker"], thumbnail: "/thumbnails/no-more-looking-sloppy-unrefined.png", duration: "1h 54m", access: "free", courseSlug: null, order: null, description: "Unimpressed by what you see in the mirror?" },
  { slug: "flatter-your-body-type", title: "Flatter Your Body Type", category: "Image & Style", categorySlug: "image-style", instructorSlugs: ["gavin-parker"], thumbnail: "/thumbnails/flatter-your-body-type.png", duration: "1h 20m", access: "free", courseSlug: null, order: null, description: "Stop wearing cuts and fabrics unflattering to your shape, which highlight the stuff you want to minimize" },
  { slug: "never-get-ghosted-again", title: "Never Get Ghosted Again", category: "Dating", categorySlug: "dating", instructorSlugs: ["gavin-parker"], thumbnail: "/thumbnails/never-get-ghosted-again.png", duration: "1h 8m", access: "premium", courseSlug: null, order: null, description: "Stop wasting time on half-interested women and getting caught off-guard by flaky behavior" },
  { slug: "5-ways-to-train-smarter", title: "Train Smarter To Maximise Building Muscle", category: "Fitness & Nutrition", categorySlug: "fitness-nutrition", instructorSlugs: ["aidan-lee"], thumbnail: "/thumbnails/5-ways-to-train-smarter.png", duration: "", access: "free", courseSlug: null, order: null, description: "For Guys Over 40: Build An Elite Physique That Will Last For Life AND Master A Zen State Of Work-Life Balance" },
  { slug: "midlife-dating-unlocked-part-8-avoiding-common-midlife-dating-mistakes", title: "Midlife Dating Unlocked Part 8: Avoiding Common Midlife Dating Mistakes", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-part-8-avoiding-common-midlife-dating-mistakes.png", duration: "17m 20s", access: "premium", courseSlug: "midlife-dating-unlocked", order: 8, description: "Eliminate Self-Sabotage: Proven Tips for Thriving in the Midlife Dating Scene" },
  { slug: "midlife-dating-unlocked-part-7-how-to-start-conversations-with-women", title: "Midlife Dating Unlocked Part 7: How To Start Conversations With Women", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-part-7-how-to-start-conversations-with-women.png", duration: "18m 00s", access: "premium", courseSlug: "midlife-dating-unlocked", order: 7, description: "How to go from struggling to approach women to confidently starting conversations." },
  { slug: "midlife-dating-unlocked-part-6-the-truth-about-high-status-high-value", title: "Midlife Dating Unlocked Part 6: The Truth About \"High Status\" & \"High Value\"", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-part-6-the-truth-about-high-status-high-value.png", duration: "15m 12s", access: "premium", courseSlug: "midlife-dating-unlocked", order: 6, description: "Forget what the manosphere teaches about status and value. Here's the real truth." },
  { slug: "midlife-dating-unlocked-part-5-obliterate-nervousness-overthinking-anxiety", title: "Midlife Dating Unlocked Part 5: Obliterate Nervousness, Overthinking, & Anxiety", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-part-5-obliterate-nervousness-overthinking-anxiety.png", duration: "15m 16s", access: "premium", courseSlug: "midlife-dating-unlocked", order: 5, description: "How to go from feeling nervous around beautiful women to to effortlessly striking up conversations with ease" },
  { slug: "midlife-dating-unlocked-part-4-approaching-women-rejection-free", title: "Midlife Dating Unlocked Part 4: Approaching Women Rejection-Free", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-part-4-approaching-women-rejection-free.png", duration: "16m 23s", access: "premium", courseSlug: "midlife-dating-unlocked", order: 4, description: "Enhance your dating game without resorting to gimmicks or rehearsed lines" },
  { slug: "midlife-dating-unlocked-part-3-uncovering-your-true-identity", title: "Midlife Dating Unlocked Part 3: Uncovering Your True Identity", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-part-3-uncovering-your-true-identity.png", duration: "14m 23s", access: "premium", courseSlug: "midlife-dating-unlocked", order: 3, description: "Rediscovering Your True Self Post-Divorce" },
  { slug: "midlife-dating-unlocked-part-2-no-faking-authentic-confidence", title: "Midlife Dating Unlocked Part 2: No-Faking, Authentic Confidence", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-part-2-no-faking-authentic-confidence.png", duration: "11m 42s", access: "premium", courseSlug: "midlife-dating-unlocked", order: 2, description: "Midlife Dating Success: Boosting Confidence and Emotional Health" },
  { slug: "midlife-dating-unlocked-part-1-the-first-step-before-dating", title: "Midlife Dating Unlocked Part 1: The First Step Before Dating", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-part-1-the-first-step-before-dating.png", duration: "15m 07s", access: "premium", courseSlug: "midlife-dating-unlocked", order: 1, description: "Step One in Post-Divorce Dating: Rebuilding Self-Esteem and Finding Your Ideal Partner" },
  { slug: "midlife-dating-unlocked-intro-the-ultimate-strategy-for-men-over-40", title: "Midlife Dating Unlocked Intro: The Ultimate Strategy For Men Over 40", category: "Dating", categorySlug: "dating", instructorSlugs: ["lee-lambert", "dean-gladwyn", "romeo-lewis"], thumbnail: "/thumbnails/midlife-dating-unlocked-intro-the-ultimate-strategy-for-men-over-40.png", duration: "21m 19s", access: "premium", courseSlug: "midlife-dating-unlocked", order: null, description: "The Ultimate Dating Strategy For Men Over 40" },
  { slug: "midlife-masculinity-unlocked-part-4-make-it-happen", title: "Midlife Masculinity Unlocked Part 4: Make It Happen", category: "Masculinity", categorySlug: "masculinity", instructorSlugs: ["dan-lavoie", "lee-lambert"], thumbnail: "/thumbnails/midlife-masculinity-unlocked-part-4-make-it-happen.png", duration: "21m 19s", access: "premium", courseSlug: "midlife-masculinity-unlocked", order: 3, description: "How To Get Out Of A Rut Without Needing Motivation" },
  { slug: "midlife-masculinity-unlocked-part-3-live-like-an-adventure", title: "Midlife Masculinity Unlocked Part 3: Live Like An Adventure", category: "Masculinity", categorySlug: "masculinity", instructorSlugs: ["dan-lavoie", "lee-lambert"], thumbnail: "/thumbnails/midlife-masculinity-unlocked-part-3-live-like-an-adventure.png", duration: "21m 19s", access: "premium", courseSlug: "midlife-masculinity-unlocked", order: 3, description: "Design And Live The Awesome, Happy Life You Were Meant To Live" },
  { slug: "midlife-masculinity-unlocked-part-2-boundaries", title: "Midlife Masculinity Unlocked Part 2: Boundaries", category: "Masculinity", categorySlug: "masculinity", instructorSlugs: ["dan-lavoie", "lee-lambert"], thumbnail: "/thumbnails/midlife-masculinity-unlocked-part-2-boundaries.png", duration: "21m 19s", access: "premium", courseSlug: "midlife-masculinity-unlocked", order: 2, description: "Command Respect And Never Take Shit From Anyone Ever Again" },
  { slug: "midlife-masculinity-unlocked-part-1-intro", title: "Midlife Masculinity Unlocked Part 1: Reclaim Your Masculinity", category: "Masculinity", categorySlug: "masculinity", instructorSlugs: ["dan-lavoie", "lee-lambert"], thumbnail: "/thumbnails/midlife-masculinity-unlocked-part-1-intro.png", duration: "21m 19s", access: "premium", courseSlug: "midlife-masculinity-unlocked", order: 1, description: "The First Step To Being Your Own Man Again After Divorce" },
  { slug: "midlife-strength-unlocked-lesson-1-intro", title: "Midlife Strength Unlocked Part 1: Transform Your Dad Bod", category: "Fitness & Nutrition", categorySlug: "fitness-nutrition", instructorSlugs: ["aidan-lee", "lee-lambert"], thumbnail: "/thumbnails/midlife-strength-unlocked-lesson-1-intro.png", duration: "11m 36s", access: "premium", courseSlug: "midlife-strength-unlocked", order: 1, description: "Guys Over 40: The Counter-Intuitive Way To Transform Your Dad Bod" },
  { slug: "overcoming-fear-anxiety", title: "Overcoming Fear & Anxiety", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/overcoming-fear-anxiety.png", duration: "23m 21s", access: "premium", courseSlug: "midlife-confidence-unlocked", order: 2, description: "Never Let Fear & Anxiety Hold You Back In Any Situation Ever Again" },
  { slug: "results-agnostic", title: "Develop A Results Agnostic Mindset", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/results-agnostic.png", duration: "19m 27s", access: "premium", courseSlug: "midlife-confidence-unlocked", order: 3, description: "Life-Changing Secret: How To Not Give A F*ck" },
  { slug: "100-shots", title: "100 Shots", category: "Business & Career", categorySlug: "business-and-career", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/100-shots.png", duration: "", access: "premium", courseSlug: "double-your-job-offers", order: 5, description: "Say Goodbye To Blasting Resumes! Discover The Proven Method To Stand Out In The Job Market And Secure The Job You've Always Wanted" },
  { slug: "solutionize", title: "Solutionize", category: "Business & Career", categorySlug: "business-and-career", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/solutionize.png", duration: "", access: "premium", courseSlug: "double-your-job-offers", order: 4, description: "Discover A New Perspective On Job Hunting That Could Greatly Increase Your Chances Of Standing Out To Potential Employers" },
  { slug: "outcome-independence", title: "Outcome Independence", category: "Business & Career", categorySlug: "business-and-career", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/outcome-independence.png", duration: "", access: "premium", courseSlug: "double-your-job-offers", order: 3, description: "A Powerful And Practical Framework Vital For Building Confidence, Navigating Challenges, And Achieving Success In Both Personal And Professional Spheres" },
  { slug: "play-your-aces", title: "Play Your Aces", category: "Business & Career", categorySlug: "business-and-career", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/play-your-aces.png", duration: "", access: "premium", courseSlug: "double-your-job-offers", order: 2, description: "Learn To Recognize And Leverage Your Unique Strengths And Experiences To Stand Out In The Job Market" },
  { slug: "posture-and-stance", title: "Convey Confidence Through Body Language", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/posture-and-stance.png", duration: "9m 19s", access: "premium", courseSlug: "midlife-confidence-unlocked", order: 8, description: "Body Language Decoded: How To Go From Projecting Weakness And Fear To Exuding Strength, Confidence, And Self-Assurance" },
  { slug: "your-hands-and-eyes", title: "Decoding Their True Intentions", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/your-hands-and-eyes.png", duration: "12m 10s", access: "premium", courseSlug: "midlife-confidence-unlocked", order: 3, description: "Body Language Decoded: How To Read Minds By Reading The Eyes And Hands" },
  { slug: "etiquette", title: "Confident Interactions With Proper Etiquette", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/etiquette.png", duration: "13m 14s", access: "premium", courseSlug: "midlife-confidence-unlocked", order: 4, description: "Polish Your Professional And Social Etiquette For Confident Interactions" },
  { slug: "epic-mission", title: "Mission Statement Workshop: The Key To An EPIC Life", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/epic-mission.png", duration: "26m 15s", access: "premium", courseSlug: "midlife-confidence-unlocked", order: 5, description: "Why You Need An EPIC Mission Statement To Live Your Best Possible Life Without Taking Shit From Anyone" },
  { slug: "social-conversation-skills", title: "Compelling Conversation Masterclass", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/social-conversation-skills.png", duration: "25m 26s", access: "premium", courseSlug: "midlife-confidence-unlocked", order: 7, description: "Master The Social Skills That Captivate, Command Attention, and Exude Confidence" },
  { slug: "frame-control", title: "Ultimate Influence And Impact", category: "Confidence", categorySlug: "confidence", instructorSlugs: ["lee-lambert"], thumbnail: "/thumbnails/frame-control.png", duration: "22m 22s", access: "premium", courseSlug: "midlife-confidence-unlocked", order: 3, description: "How To Own Every Interaction And Influence Others' Perceptions Of You" },
  { slug: "instant-impressive-image", title: "Instant Impressive Image", category: "Image & Style", categorySlug: "image-style", instructorSlugs: ["gavin-parker"], thumbnail: "/thumbnails/instant-impressive-image.png", duration: "", access: "premium", courseSlug: "instant-impressive-image", order: 1, description: "Get noticed, even if you're average-looking, balding, short, with a dad bod" },
];

// ---- helpers ----------------------------------------------------------------

export const getInstructor = (slug: string): Instructor | undefined =>
  instructors.find((i) => i.slug === slug);

export const instructorNames = (slugs: string[]): string => {
  const names = slugs.map((s) => getInstructor(s)?.name).filter(Boolean) as string[];
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
};

export const getCourse = (slug: string | null): Course | undefined =>
  slug ? courses.find((c) => c.slug === slug) : undefined;

export const lessonsByCategory = (categoryName: string): Lesson[] =>
  lessons.filter((l) => l.category === categoryName);

export const categoryCount = (categoryName: string): number =>
  lessonsByCategory(categoryName).length;

export const freeLessons = (): Lesson[] => lessons.filter((l) => l.access === 'free');
export const premiumLessons = (): Lesson[] => lessons.filter((l) => l.access === 'premium');

export const lessonsByInstructor = (slug: string): Lesson[] =>
  lessons.filter((l) => l.instructorSlugs.includes(slug));

export const relatedLessons = (lesson: Lesson, limit = 3): Lesson[] =>
  lessons
    .filter((l) => l.slug !== lesson.slug && l.category === lesson.category)
    .concat(lessons.filter((l) => l.slug !== lesson.slug && l.category !== lesson.category))
    .slice(0, limit);

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
  instructor: instructorNames(l.instructorSlugs),
  thumbnail: l.thumbnail,
  duration: l.duration,
  access: l.access,
  href: `/lessons/${l.slug}`,
});
