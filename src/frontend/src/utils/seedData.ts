const NAGRIK_FEED_KEY = "loksetu_nagrik_feed";
const TALKUP_GROUPS_KEY = "loksetu_talkup_groups";
const SEED_DONE_KEY = "loksetu_seeded_v1";

export interface SeedReport {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  gpsLocation: string;
  mediaUrl: string;
  mediaIsVideo: boolean;
  upvotes: number;
  downvotes: number;
  reporterName: string;
  reporterInitials: string;
  identityMode: "anonymous" | "real";
  timestamp: number;
  verified: boolean;
  comments: unknown[];
}

export interface SeedGroup {
  id: string;
  name: string;
  description: string;
  city: string;
  type: string;
  accessMode: string;
  memberCount: number;
  adminCanPostOnly: boolean;
  posts: {
    id: string;
    content: string;
    authorName: string;
    authorInitials: string;
    timestamp: number;
    likeCount: number;
    dislikeCount: number;
    comments: unknown[];
  }[];
  joined: boolean;
}

// Category-matched Unsplash images — logically matched to each report's problem
const nagrikReports: SeedReport[] = [
  {
    id: "seed-1",
    title: "Massive pothole on SV Road causing accidents",
    description:
      "A huge pothole has developed near the Borivali station causing multiple bike accidents. Needs immediate repair.",
    category: "infrastructure",
    city: "Mumbai",
    gpsLocation: "19.2307° N, 72.8567° E",
    // Road with potholes / road damage
    mediaUrl:
      "https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=400&q=60",
    mediaIsVideo: false,
    upvotes: 47,
    downvotes: 2,
    reporterName: "Rahul Sharma",
    reporterInitials: "RS",
    identityMode: "real",
    timestamp: Date.now() - 3600000 * 2,
    verified: true,
    comments: [],
  },
  {
    id: "seed-2",
    title: "Garbage dumped near Yamuna bank for 3 weeks",
    description:
      "Uncollected garbage near the Yamuna bank at Geeta Colony is causing severe stench and health hazard.",
    category: "sanitation",
    city: "Delhi",
    gpsLocation: "28.6462° N, 77.2574° E",
    // Garbage / waste dump
    mediaUrl:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=60",
    mediaIsVideo: false,
    upvotes: 93,
    downvotes: 1,
    reporterName: "Anonymous Citizen",
    reporterInitials: "AC",
    identityMode: "anonymous",
    timestamp: Date.now() - 3600000 * 5,
    verified: true,
    comments: [],
  },
  {
    id: "seed-3",
    title: "Streetlights out on Koramangala 5th Block",
    description:
      "All streetlights on 5th Block main road have been non-functional for 2 weeks. Very unsafe at night.",
    category: "publicSafety",
    city: "Bangalore",
    gpsLocation: "12.9352° N, 77.6245° E",
    // Dark street at night / broken streetlight
    mediaUrl:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=60",
    mediaIsVideo: false,
    upvotes: 65,
    downvotes: 3,
    reporterName: "Priya Nair",
    reporterInitials: "PN",
    identityMode: "real",
    timestamp: Date.now() - 3600000 * 10,
    verified: false,
    comments: [],
  },
  {
    id: "seed-4",
    title: "Broken water pipeline flooding Aundh road",
    description:
      "Water pipeline burst near Aundh-ITI road causing road flooding and water wastage for 4 days.",
    category: "infrastructure",
    city: "Pune",
    gpsLocation: "18.5590° N, 73.8085° E",
    // Flooded road / water burst
    mediaUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&q=60",
    mediaIsVideo: false,
    upvotes: 38,
    downvotes: 0,
    reporterName: "Amit Kulkarni",
    reporterInitials: "AK",
    identityMode: "real",
    timestamp: Date.now() - 3600000 * 18,
    verified: false,
    comments: [],
  },
  {
    id: "seed-5",
    title: "Open drain in residential area — mosquito breeding",
    description:
      "Open drain near Ring Road in Surat is overflowing. Mosquito breeding causing dengue fear in the area.",
    category: "sanitation",
    city: "Surat",
    gpsLocation: "21.1702° N, 72.8311° E",
    // Open dirty drain / sewage overflow
    mediaUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=60",
    mediaIsVideo: false,
    upvotes: 29,
    downvotes: 4,
    reporterName: "Anonymous Citizen",
    reporterInitials: "AC",
    identityMode: "anonymous",
    timestamp: Date.now() - 3600000 * 24,
    verified: false,
    comments: [],
  },
  {
    id: "seed-6",
    title: "Traffic signals non-functional at Vijay Nagar square",
    description:
      "Three traffic signals at the main Vijay Nagar crossing in Indore have been broken for a week causing jams.",
    category: "infrastructure",
    city: "Indore",
    gpsLocation: "22.7196° N, 75.8577° E",
    // Traffic jam / broken traffic lights
    mediaUrl:
      "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&q=60",
    mediaIsVideo: false,
    upvotes: 54,
    downvotes: 2,
    reporterName: "Deepak Verma",
    reporterInitials: "DV",
    identityMode: "real",
    timestamp: Date.now() - 3600000 * 30,
    verified: true,
    comments: [],
  },
  {
    id: "seed-7",
    title: "Road damaged by landslide near Banihal remains unrepaired",
    description:
      "Landslide debris on NH44 near Banihal has blocked half the road for 10 days. Very dangerous for commuters.",
    category: "infrastructure",
    city: "Jammu & Kashmir",
    gpsLocation: "33.4890° N, 75.2030° E",
    // Mountain road landslide / road blocked by rocks
    mediaUrl:
      "https://images.unsplash.com/photo-1504370805625-d32c054b24a8?w=400&q=60",
    mediaIsVideo: false,
    upvotes: 72,
    downvotes: 1,
    reporterName: "Tariq Lone",
    reporterInitials: "TL",
    identityMode: "real",
    timestamp: Date.now() - 3600000 * 36,
    verified: true,
    comments: [],
  },
];

const talkupGroups: SeedGroup[] = [
  {
    id: "grp-seed-1",
    name: "Mumbai Civic Warriors",
    description:
      "Active citizens of Mumbai reporting and resolving civic issues together.",
    city: "Mumbai",
    type: "public",
    accessMode: "open",
    memberCount: 1243,
    adminCanPostOnly: false,
    posts: [
      {
        id: "grp-post-1",
        content:
          "The BMC has finally responded to our report about Bandra waterlogging! Keep reporting, it works!",
        authorName: "Sunita Patil",
        authorInitials: "SP",
        timestamp: Date.now() - 3600000,
        likeCount: 34,
        dislikeCount: 0,
        comments: [],
      },
    ],
    joined: false,
  },
  {
    id: "grp-seed-2",
    name: "Delhi Green Mission",
    description:
      "Citizens working to report illegal encroachments on parks and green spaces.",
    city: "Delhi",
    type: "public",
    accessMode: "open",
    memberCount: 876,
    adminCanPostOnly: false,
    posts: [
      {
        id: "grp-post-2",
        content:
          "Join us this Sunday at Lodhi Gardens for a citizen clean-up drive. Every hand counts!",
        authorName: "Ravi Gupta",
        authorInitials: "RG",
        timestamp: Date.now() - 7200000,
        likeCount: 89,
        dislikeCount: 2,
        comments: [],
      },
    ],
    joined: false,
  },
  {
    id: "grp-seed-3",
    name: "Bangalore Roads Watch",
    description:
      "Tracking pothole repairs and road quality issues across Namma Bengaluru.",
    city: "Bangalore",
    type: "public",
    accessMode: "open",
    memberCount: 2105,
    adminCanPostOnly: false,
    posts: [
      {
        id: "grp-post-3",
        content:
          "BBMP portal is finally live for pothole complaints. Screenshot and tag your ward number when reporting!",
        authorName: "Meera Rao",
        authorInitials: "MR",
        timestamp: Date.now() - 10800000,
        likeCount: 156,
        dislikeCount: 4,
        comments: [],
      },
    ],
    joined: false,
  },
];

export function seedIfEmpty() {
  if (localStorage.getItem(SEED_DONE_KEY)) return;

  try {
    const existingFeed = localStorage.getItem(NAGRIK_FEED_KEY);
    if (!existingFeed || JSON.parse(existingFeed).length === 0) {
      localStorage.setItem(NAGRIK_FEED_KEY, JSON.stringify(nagrikReports));
    }
    const existingGroups = localStorage.getItem(TALKUP_GROUPS_KEY);
    if (!existingGroups || JSON.parse(existingGroups).length === 0) {
      localStorage.setItem(TALKUP_GROUPS_KEY, JSON.stringify(talkupGroups));
    }
    localStorage.setItem(SEED_DONE_KEY, "1");
  } catch {
    // Ignore storage errors
  }
}

export function getSeedReports(): SeedReport[] {
  try {
    const raw = localStorage.getItem(NAGRIK_FEED_KEY);
    if (raw) return JSON.parse(raw) as SeedReport[];
  } catch {
    // ignore
  }
  return [];
}

export function saveSeedReports(reports: SeedReport[]) {
  try {
    localStorage.setItem(NAGRIK_FEED_KEY, JSON.stringify(reports));
  } catch {
    // ignore
  }
}

export { NAGRIK_FEED_KEY, TALKUP_GROUPS_KEY };
