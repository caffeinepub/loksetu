import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Camera,
  Edit2,
  Heart,
  ImageIcon,
  MessageCircle,
  MoreVertical,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  UserCircle,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CommentsSheet from "../components/CommentsSheet";
import UserProfileSheet from "../components/UserProfileSheet";
import {
  useCommunityPosts,
  useConversationHistory,
  useConversations,
  useCreateCommunityPost,
  useLikeCommunityPost,
  useSendPrivateMessage,
  useSetStatus,
  useStatuses,
} from "../hooks/useQueries";
import { useAppStore } from "../store/appStore";

const SAMPLE_COMMUNITY_POSTS: import("../backend.d").CommunityPost[] = [
  {
    id: BigInt(1),
    displayName: "Rajesh Kumar",
    city: "Delhi",
    content:
      "The new metro extension to Janakpuri is a game changer! Finally connecting the western suburbs. 🚇",
    likeCount: BigInt(42),
    timestamp: BigInt((Date.now() - 3_600_000) * 1_000_000),
    author: null as any,
  },
  {
    id: BigInt(2),
    displayName: "Nagrik #4821",
    city: "Mumbai",
    content:
      "Mumbai rains are back! Local trains delayed by 20 mins. Stay safe and plan ahead. 🌧️",
    likeCount: BigInt(17),
    timestamp: BigInt((Date.now() - 7_200_000) * 1_000_000),
    author: null as any,
  },
  {
    id: BigInt(3),
    displayName: "Priya Sharma",
    city: "Bengaluru",
    content:
      "Namma Metro Purple Line extension inauguration this month — huge relief for IT corridor commuters!",
    likeCount: BigInt(103),
    timestamp: BigInt((Date.now() - 86_400_000) * 1_000_000),
    author: null as any,
  },
  {
    id: BigInt(4),
    displayName: "Amit Singh",
    city: "Pune",
    content:
      "Pune Metro Phase 2 construction is on schedule. Ring Road will see major traffic changes by July. 🚧",
    likeCount: BigInt(56),
    timestamp: BigInt((Date.now() - 43_200_000) * 1_000_000),
    author: null as any,
  },
];

const SAMPLE_STATUSES: import("../backend.d").Status[] = [
  {
    displayName: "Ankit V.",
    city: "Delhi",
    content: "Morning walk at India Gate — perfect weather today! 🌅",
    timestamp: BigInt((Date.now() - 1_800_000) * 1_000_000),
    author: null as any,
  },
  {
    displayName: "Meera S.",
    city: "Chennai",
    content:
      "Just filed a road pothole complaint on Loksetu. Let's see how fast it gets resolved!",
    timestamp: BigInt((Date.now() - 5_400_000) * 1_000_000),
    author: null as any,
  },
  {
    displayName: "Nagrik #2219",
    city: "Mumbai",
    content: "Heavy rain alert in Dharavi — stay safe everyone 🌧️",
    timestamp: BigInt((Date.now() - 10_800_000) * 1_000_000),
    author: null as any,
  },
  {
    displayName: "Kavya Reddy",
    city: "Hyderabad",
    content: "GHMC pothole repair drive on Tank Bund Road — great work! 👏",
    timestamp: BigInt((Date.now() - 21_600_000) * 1_000_000),
    author: null as any,
  },
];

const SAMPLE_COMMUNITIES = [
  {
    id: 1,
    name: "Delhi Traffic & Roads",
    type: "Public",
    members: 4821,
    description:
      "Discuss road conditions, traffic updates, and civic infrastructure in Delhi.",
    emoji: "🚦",
    allowPosting: true,
    admins: ["Rajan K.", "Admin"],
    samplePosts: [
      {
        author: "Rajan K.",
        text: "NH-48 widening work complete near Mahipalpur — major congestion relief! 🚗",
        likes: 34,
      },
      {
        author: "Nagrik #7102",
        text: "Signal timing at Azadpur chowk is broken again. Filed complaint on Loksetu.",
        likes: 12,
      },
      {
        author: "Sunita M.",
        text: "Okhla flyover under repair — avoid ITO route this week.",
        likes: 8,
      },
    ],
  },
  {
    id: 2,
    name: "Mumbai Local Train",
    type: "Public",
    members: 12430,
    description:
      "Real-time updates, delays, and tips for Mumbai's lifeline local train network.",
    emoji: "🚂",
    allowPosting: true,
    admins: ["MumbaiMod"],
    samplePosts: [
      {
        author: "MumbaiMod",
        text: "⚠️ Harbour Line delay: 15-20 min due to signal failure at Kurla.",
        likes: 89,
      },
      {
        author: "Rahul D.",
        text: "Western line running smooth today. AC locals more frequent now! 🙌",
        likes: 44,
      },
    ],
  },
  {
    id: 3,
    name: "Bengaluru IT Corridor RWA",
    type: "Private",
    members: 983,
    description:
      "Resident welfare discussions for the Whitefield and Electronic City corridors.",
    emoji: "🏘️",
    allowPosting: false,
    admins: ["Priya S.", "Rajesh M."],
    samplePosts: [
      {
        author: "Priya S.",
        text: "RWA meeting this Sunday 10AM at Prestige Shantiniketan clubhouse. All residents please attend.",
        likes: 61,
      },
      {
        author: "Rajesh M.",
        text: "Security upgrade: new CCTV cameras installed at all 4 entry gates. ✅",
        likes: 27,
      },
    ],
  },
  {
    id: 4,
    name: "Pune Civic Watch",
    type: "Public",
    members: 3107,
    description:
      "Civic issue tracking, PCMC updates, and PMC announcements for Pune residents.",
    emoji: "👁️",
    allowPosting: true,
    admins: ["PuneCivic"],
    samplePosts: [
      {
        author: "PuneCivic",
        text: "PMC new water timings: 6-8AM and 6-8PM for Kothrud and Karve Nagar zones.",
        likes: 53,
      },
      {
        author: "Aakash P.",
        text: "Potholes on Baner Road finally patched after 3 complaints! Persistence pays. 💪",
        likes: 38,
      },
      {
        author: "Nagrik #5541",
        text: "Street lights at Wakad junction not working for 10 days — anyone else?",
        likes: 15,
      },
    ],
  },
];

type Community = (typeof SAMPLE_COMMUNITIES)[0];

interface TalkUpTabProps {
  selectedCity: string;
}

function timeAgo(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ──────────────────────────────────────────────
// Create Community Modal
// ──────────────────────────────────────────────
function CreateCommunityModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Public" | "Private" | "Both">("Public");

  function handleCreate() {
    if (!name.trim()) return;
    toast.success("Community created! Members can now join.");
    setName("");
    setDescription("");
    setType("Public");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-card rounded-t-2xl z-50 shadow-nav"
          data-ocid="communities.modal"
        >
          <div className="px-4 pt-4 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm">Create New Community</h4>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground"
                data-ocid="communities.close_button"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Community Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Delhi Cyclists Network"
                  className="text-sm"
                  data-ocid="communities.input"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">
                  Description (optional)
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this community about?"
                  className="resize-none text-sm min-h-[60px]"
                  data-ocid="communities.textarea"
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Community Type</Label>
                <div className="flex gap-2">
                  {(["Public", "Private", "Both"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`flex-1 py-2 text-xs rounded-lg border font-semibold transition-colors ${
                        type === t
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                      onClick={() => setType(t)}
                      data-ocid="communities.toggle"
                    >
                      {t === "Both" ? "Public + Private" : t}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {type === "Public" && "Anyone can join and see posts."}
                  {type === "Private" &&
                    "Invite-only. Posts visible to members only."}
                  {type === "Both" &&
                    "Public channel + private group within same community."}
                </p>
              </div>
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-1"
                onClick={handleCreate}
                disabled={!name.trim()}
                data-ocid="communities.submit_button"
              >
                Create Community
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────────
// Community Detail View
// ──────────────────────────────────────────────
function CommunityDetailView({
  community,
  onBack,
}: {
  community: Community;
  onBack: () => void;
}) {
  const [postText, setPostText] = useState("");
  const [localPosts, setLocalPosts] = useState(community.samplePosts);
  const [likedIdxs, setLikedIdxs] = useState<Set<number>>(new Set());
  const [localLikes, setLocalLikes] = useState<number[]>(
    community.samplePosts.map((p) => p.likes),
  );

  function handleSend() {
    if (!postText.trim()) return;
    setLocalPosts((prev) => [
      { author: "You", text: postText, likes: 0 },
      ...prev,
    ]);
    setLocalLikes((prev) => [0, ...prev]);
    setPostText("");
    toast.success("Post shared!");
  }

  function toggleLike(idx: number) {
    const isLiked = likedIdxs.has(idx);
    setLikedIdxs((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(idx);
      else next.add(idx);
      return next;
    });
    setLocalLikes((prev) =>
      prev.map((c, i) => (i === idx ? (isLiked ? c - 1 : c + 1) : c)),
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          onClick={onBack}
          data-ocid="communities.button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{community.emoji}</span>
            <h3 className="text-sm font-bold text-foreground truncate">
              {community.name}
            </h3>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                community.type === "Private"
                  ? "border-orange-400 text-orange-600"
                  : "border-success text-success"
              }`}
            >
              {community.type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Admins: {community.admins.join(", ")} ·{" "}
            {community.members.toLocaleString("en-IN")} members
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24">
        {localPosts.map((post, idx) => (
          <motion.div
            key={`${post.author}-${idx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-card rounded-xl p-3 shadow-card border border-border"
            data-ocid={`communities.item.${idx + 1}`}
          >
            <div className="flex items-start gap-2.5">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-accent/10 text-accent font-bold">
                  {initials(post.author)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">
                  {post.author}
                </p>
                <p className="text-sm text-foreground mt-1 leading-snug">
                  {post.text}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    type="button"
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      likedIdxs.has(idx)
                        ? "text-rose-500"
                        : "text-muted-foreground hover:text-rose-400"
                    }`}
                    onClick={() => toggleLike(idx)}
                    data-ocid={`communities.toggle.${idx + 1}`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        likedIdxs.has(idx) ? "fill-rose-500" : ""
                      }`}
                    />
                    <span>{localLikes[idx]}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Compose area or read-only banner */}
      {community.allowPosting ? (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
          <Input
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Write something..."
            className="flex-1 rounded-full text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            data-ocid="communities.input"
          />
          <Button
            size="icon"
            className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground flex-shrink-0 w-9 h-9"
            onClick={handleSend}
            disabled={!postText.trim()}
            data-ocid="communities.submit_button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-border bg-muted/60">
          <div className="flex items-center gap-2 justify-center py-1">
            <span className="text-base">🔒</span>
            <p className="text-xs text-muted-foreground text-center">
              Only the channel owner and admins can post in this channel
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Community Sub-tab (Nagrik Community)
// ──────────────────────────────────────────────
function CommunitySubTab({ selectedCity }: { selectedCity: string }) {
  const [joinedBanner, setJoinedBanner] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [postMode, setPostMode] = useState<"real" | "anon">("real");
  const [anonAlias, setAnonAlias] = useState(
    `Nagrik #${Math.floor(1000 + Math.random() * 9000)}`,
  );
  const [cityFilter, setCityFilter] = useState<"all" | "city">("all");
  const [likedSet, setLikedSet] = useState<Set<bigint>>(new Set());
  const [localLikeCounts, setLocalLikeCounts] = useState<Map<bigint, bigint>>(
    new Map(),
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profilePost, setProfilePost] = useState<{
    name: string;
    city: string;
    isAnon: boolean;
  } | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState<
    import("../backend.d").CommunityPost[]
  >([]);
  const [editingLocalPostId, setEditingLocalPostId] = useState<bigint | null>(
    null,
  );
  const [editLocalContent, setEditLocalContent] = useState("");

  const { addPost, deletePost, editPost } = useAppStore();

  const cityArg = cityFilter === "city" ? selectedCity : undefined;
  const { data: posts, isLoading } = useCommunityPosts(cityArg ?? "");
  const likeMutation = useLikeCommunityPost();
  const createPost = useCreateCommunityPost();

  const allPosts = posts && posts.length > 0 ? posts : SAMPLE_COMMUNITY_POSTS;
  const filteredPosts =
    cityFilter === "city"
      ? allPosts.filter((p) => p.city === selectedCity)
      : allPosts;
  const localFiltered =
    cityFilter === "city"
      ? localPosts.filter((p) => p.city === selectedCity)
      : localPosts;
  const displayPosts = [...localFiltered, ...filteredPosts];
  const localPostIds = new Set(localPosts.map((p) => p.id.toString()));

  const feedLabel =
    cityFilter === "all"
      ? "All India · Public feed"
      : `${selectedCity} · Filtered`;

  async function handlePost() {
    if (!postText.trim()) return;
    const mediaObjUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;
    const newPost: import("../backend.d").CommunityPost = {
      id: BigInt(Date.now()),
      displayName: postMode === "anon" ? anonAlias : "You",
      city: selectedCity,
      content: postText,
      likeCount: BigInt(0),
      timestamp: BigInt(Date.now() * 1_000_000),
      author: null as any,
    };
    (newPost as any).localMediaUrl = mediaObjUrl;
    (newPost as any).localMediaIsVideo =
      selectedFile?.type?.startsWith("video/") || false;
    setLocalPosts((prev) => [newPost, ...prev]);
    addPost(newPost);
    setPostText("");
    setSelectedFile(null);
    setComposeOpen(false);
    toast.success("Post shared to Nagrik community!");
    try {
      await createPost.mutateAsync({
        city: selectedCity,
        content: newPost.content,
        mediaBlobId: null,
        displayName: postMode === "anon" ? anonAlias : undefined,
        anonymous: postMode === "anon",
      });
    } catch {
      // Backend failed but post already shown locally
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence>
        {joinedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-4 mt-3 mb-2 bg-success/10 border border-success/30 rounded-xl px-3 py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-xs text-success font-semibold">
                You are now part of the Nagrik community 🇮🇳
              </span>
            </div>
            <button
              type="button"
              onClick={() => setJoinedBanner(false)}
              className="text-muted-foreground text-xs ml-2"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Nagrik Community
            </h3>
            <p className="text-xs text-muted-foreground">{feedLabel}</p>
          </div>
        </div>
        {/* Filter chips */}
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border font-semibold transition-colors ${
              cityFilter === "all"
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-muted text-muted-foreground border-border"
            }`}
            onClick={() => setCityFilter("all")}
            data-ocid="community.tab"
          >
            🇮🇳 All India
          </button>
          <button
            type="button"
            className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border font-semibold transition-colors ${
              cityFilter === "city"
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-muted text-muted-foreground border-border"
            }`}
            onClick={() => setCityFilter("city")}
            data-ocid="community.tab"
          >
            📍 {selectedCity}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-3 space-y-2"
                data-ocid="community.loading_state"
              >
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))
          : displayPosts.map((post, idx) => (
              <motion.div
                key={post.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-xl p-3 shadow-card border border-border"
                data-ocid={`community.item.${idx + 1}`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    onClick={() =>
                      setProfilePost({
                        name: post.displayName,
                        city: post.city,
                        isAnon: post.displayName.startsWith("Nagrik #"),
                      })
                    }
                    data-ocid={`community.item.${idx + 1}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-accent/10 text-accent font-bold">
                        {initials(post.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs font-bold text-foreground hover:text-accent transition-colors"
                        onClick={() =>
                          setProfilePost({
                            name: post.displayName,
                            city: post.city,
                            isAnon: post.displayName.startsWith("Nagrik #"),
                          })
                        }
                      >
                        {post.displayName}
                      </button>
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {post.city}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {timeAgo(post.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-snug">
                      {editingLocalPostId === post.id ? (
                        <span className="block space-y-1.5">
                          <Textarea
                            value={editLocalContent}
                            onChange={(e) =>
                              setEditLocalContent(e.target.value)
                            }
                            className="text-sm resize-none"
                            rows={3}
                            data-ocid={`community.item.${idx + 1}`}
                          />
                          <span className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                editPost(post.id, editLocalContent);
                                setLocalPosts((prev) =>
                                  prev.map((p) =>
                                    p.id === post.id
                                      ? { ...p, content: editLocalContent }
                                      : p,
                                  ),
                                );
                                setEditingLocalPostId(null);
                                toast.success("Post updated");
                              }}
                              data-ocid={`community.item.${idx + 1}`}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => setEditingLocalPostId(null)}
                              data-ocid={`community.item.${idx + 1}`}
                            >
                              Cancel
                            </Button>
                          </span>
                        </span>
                      ) : (
                        post.content
                      )}
                    </p>
                    {post.mediaBlob && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <img
                          src={post.mediaBlob.getDirectURL()}
                          alt="post media"
                          className="w-full max-h-48 object-cover"
                        />
                      </div>
                    )}
                    {localPostIds.has(post.id.toString()) &&
                      editingLocalPostId !== post.id && (
                        <div className="flex justify-end mt-1">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-accent px-2 py-0.5 rounded transition-colors"
                              onClick={() => {
                                setEditingLocalPostId(post.id);
                                setEditLocalContent(post.content);
                              }}
                              data-ocid={`community.item.${idx + 1}`}
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive px-2 py-0.5 rounded transition-colors"
                              onClick={() => {
                                deletePost(post.id);
                                setLocalPosts((prev) =>
                                  prev.filter((p) => p.id !== post.id),
                                );
                                toast.success("Post deleted");
                              }}
                              data-ocid={`community.item.${idx + 1}`}
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          likedSet.has(post.id)
                            ? "text-rose-500"
                            : "text-muted-foreground hover:text-rose-400"
                        }`}
                        onClick={() => {
                          const isLiked = likedSet.has(post.id);
                          setLikedSet((prev) => {
                            const next = new Set(prev);
                            if (isLiked) next.delete(post.id);
                            else next.add(post.id);
                            return next;
                          });
                          setLocalLikeCounts((prev) => {
                            const next = new Map(prev);
                            const cur = next.get(post.id) ?? post.likeCount;
                            next.set(
                              post.id,
                              isLiked ? cur - BigInt(1) : cur + BigInt(1),
                            );
                            return next;
                          });
                          likeMutation.mutate(post.id);
                        }}
                        data-ocid={`community.toggle.${idx + 1}`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            likedSet.has(post.id) ? "fill-rose-500" : ""
                          }`}
                        />
                        <span>
                          {(
                            localLikeCounts.get(post.id) ?? post.likeCount
                          ).toString()}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors ml-2"
                        onClick={() => setCommentPostId(post.id.toString())}
                        data-ocid={`community.item.${idx + 1}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        {!isLoading && displayPosts.length === 0 && (
          <div className="text-center py-12" data-ocid="community.empty_state">
            <div className="text-4xl mb-3">🏙️</div>
            <p className="text-muted-foreground text-sm">
              No posts from {selectedCity} yet.
            </p>
            <p className="text-muted-foreground text-xs">
              Switch to All India to see all posts.
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center z-30"
        onClick={() => setComposeOpen(true)}
        data-ocid="community.open_modal_button"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Compose Sheet */}
      <AnimatePresence>
        {composeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setComposeOpen(false)}
          />
        )}
        {composeOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-card rounded-t-2xl z-50 shadow-nav"
          >
            <div className="px-4 pt-4 pb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm">New Community Post</h4>
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="text-muted-foreground"
                  data-ocid="community.close_button"
                >
                  ✕
                </button>
              </div>
              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Share something with the Nagrik community..."
                className="resize-none min-h-[80px] text-sm mb-3"
                data-ocid="community.textarea"
              />

              {/* Identity toggle — pill buttons */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Post as:
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPostMode("real")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border-2 text-xs font-semibold transition-all ${
                      postMode === "real"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                    }`}
                    data-ocid="community.toggle"
                  >
                    <UserCircle className="w-4 h-4" />
                    Real Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostMode("anon")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border-2 text-xs font-semibold transition-all ${
                      postMode === "anon"
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "bg-muted text-muted-foreground border-border hover:border-foreground/40"
                    }`}
                    data-ocid="community.toggle"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Anonymous
                  </button>
                </div>
              </div>

              {postMode === "anon" && (
                <div className="mb-3">
                  <Input
                    value={anonAlias}
                    onChange={(e) => setAnonAlias(e.target.value)}
                    placeholder="Your alias"
                    className="text-sm h-8"
                    data-ocid="community.input"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="community-gallery-input"
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center cursor-pointer"
                  data-ocid="community.upload_button"
                  title="Photo/Video from Gallery"
                >
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </label>
                <label
                  htmlFor="community-camera-input"
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center cursor-pointer"
                  title="Take Photo/Video with Camera"
                >
                  <Camera className="w-4 h-4 text-muted-foreground" />
                </label>
                <input
                  id="community-gallery-input"
                  type="file"
                  accept="image/*,video/*"
                  className="sr-only"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                <input
                  id="community-camera-input"
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                {selectedFile &&
                  (selectedFile.type.startsWith("video/") ? (
                    <video
                      src={URL.createObjectURL(selectedFile)}
                      controls
                      className="max-h-20 rounded-lg mt-1 w-full"
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="preview"
                      className="max-h-20 rounded-lg mt-1 object-cover"
                    />
                  ))}
                <Button
                  size="sm"
                  className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handlePost}
                  disabled={!postText.trim() || createPost.isPending}
                  data-ocid="community.submit_button"
                >
                  {createPost.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {profilePost && (
        <UserProfileSheet
          open={!!profilePost}
          onClose={() => setProfilePost(null)}
          displayName={profilePost.name}
          city={profilePost.city}
          isAnonymous={profilePost.isAnon}
          postCount={Math.floor(Math.random() * 20) + 1}
        />
      )}
      {commentPostId && (
        <CommentsSheet
          open={!!commentPostId}
          onClose={() => setCommentPostId(null)}
          postTitle={
            displayPosts
              .find((p) => p.id.toString() === commentPostId)
              ?.content?.slice(0, 60) ?? "Community Post"
          }
          postType="post"
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Chats Sub-tab
// ──────────────────────────────────────────────
function ChatsSubTab({ joinedCommunities }: { joinedCommunities: number[] }) {
  const [activeConvo, setActiveConvo] = useState<Principal | null>(null);
  const [msgText, setMsgText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: conversations, isLoading: convoLoading } = useConversations();
  const { data: history, isLoading: histLoading } =
    useConversationHistory(activeConvo);
  const sendMsg = useSendPrivateMessage();

  async function handleSend() {
    if (!msgText.trim() || !activeConvo) return;
    try {
      await sendMsg.mutateAsync({ receiver: activeConvo, content: msgText });
      setMsgText("");
    } catch {
      toast.error("Failed to send message");
    }
  }

  // All joined communities including Nagrik (always joined)
  const joinedList = [
    {
      name: "Nagrik Community",
      emoji: "🌐",
      badge: "All India",
      badgeClass: "bg-blue-100 text-blue-700",
    },
    ...SAMPLE_COMMUNITIES.filter((c) => joinedCommunities.includes(c.id)).map(
      (c) => ({
        name: c.name,
        emoji: c.emoji,
        badge: c.type,
        badgeClass:
          c.type === "Private"
            ? "bg-purple-100 text-purple-700"
            : "bg-green-100 text-green-700",
      }),
    ),
  ];

  if (activeConvo) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            onClick={() => setActiveConvo(null)}
            data-ocid="chats.button"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {activeConvo.toText().slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground">
            {activeConvo.toText().slice(0, 12)}...
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {histLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}
                  data-ocid="chats.loading_state"
                >
                  <Skeleton className="h-8 w-48 rounded-2xl" />
                </div>
              ))
            : (history ?? []).map((msg, i) => {
                const isSent = msg.sender.toText() !== activeConvo.toText();
                return (
                  <div
                    key={msg.id.toString()}
                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                    data-ocid={`chats.item.${i + 1}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        isSent
                          ? "bg-accent text-accent-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-60 mt-0.5 text-right">
                        {timeAgo(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
          {!histLoading && (history ?? []).length === 0 && (
            <div className="text-center py-12" data-ocid="chats.empty_state">
              <p className="text-muted-foreground text-sm">
                No messages yet. Say hi!
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
          <Input
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            data-ocid="chats.input"
          />
          <Button
            size="icon"
            className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground flex-shrink-0 w-9 h-9"
            onClick={handleSend}
            disabled={!msgText.trim() || sendMsg.isPending}
            data-ocid="chats.submit_button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* My Communities & Channels */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          My Communities & Channels
        </h3>
        <div className="space-y-1.5">
          {joinedList.map((c, i) => (
            <button
              key={c.name}
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
              data-ocid={`chats.item.${i + 1}`}
            >
              <span className="text-lg">{c.emoji}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">
                  {c.name}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${c.badgeClass}`}
              >
                {c.badge}
              </span>
              <span className="text-muted-foreground text-sm">›</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Direct Messages</h3>
          <p className="text-xs text-muted-foreground">
            1-on-1 with any citizen
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 border-accent text-accent"
          onClick={() => setCreateOpen(true)}
          data-ocid="communities.open_modal_button"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> New Community
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        {convoLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                data-ocid="chats.loading_state"
              >
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))
          : (conversations ?? []).map((principal, i) => (
              <button
                key={principal.toText()}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                onClick={() => setActiveConvo(principal)}
                data-ocid={`chats.item.${i + 1}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                    {principal.toText().slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {principal.toText().slice(0, 20)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tap to open conversation
                  </p>
                </div>
              </button>
            ))}
        {!convoLoading && (conversations ?? []).length === 0 && (
          <div className="text-center py-12" data-ocid="chats.empty_state">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted-foreground text-sm">
              No conversations yet
            </p>
            <p className="text-muted-foreground text-xs">
              Start a chat from a community post
            </p>
          </div>
        )}
      </div>
      <CreateCommunityModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// Status Sub-tab
// ──────────────────────────────────────────────
function StatusSubTab({ selectedCity }: { selectedCity: string }) {
  const [statusText, setStatusText] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [likedIdxs, setLikedIdxs] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<number[]>(
    SAMPLE_STATUSES.map(() => Math.floor(4 + Math.random() * 12)),
  );
  const [statusMedia, setStatusMedia] = useState<File | null>(null);
  const [statusMediaUrl, setStatusMediaUrl] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [viewingStatus, setViewingStatus] = useState<number | null>(null);
  const [statusProfile, setStatusProfile] = useState<{
    name: string;
    city: string;
    isAnon: boolean;
  } | null>(null);
  const [statusCommentIdx, setStatusCommentIdx] = useState<number | null>(null);

  function handleMediaSelect(file: File | undefined) {
    if (!file) return;
    if (statusMediaUrl) URL.revokeObjectURL(statusMediaUrl);
    setStatusMedia(file);
    setStatusMediaUrl(URL.createObjectURL(file));
    setShowMediaPicker(false);
  }

  const { data: statuses, isLoading } = useStatuses("");
  const setStatus = useSetStatus();

  interface LocalStatus {
    id: number;
    displayName: string;
    city: string;
    content: string;
    timestamp: bigint;
    likeCount: bigint;
    mediaBlob: null;
    localMediaUrl: string | null;
    localMediaIsVideo: boolean;
  }
  const [localStatuses, setLocalStatuses] = useState<LocalStatus[]>([]);
  const displayStatuses =
    statuses && statuses.length > 0
      ? [...localStatuses, ...statuses]
      : localStatuses.length > 0
        ? [...localStatuses, ...SAMPLE_STATUSES]
        : SAMPLE_STATUSES;

  async function handlePost() {
    if (!statusText.trim() && !statusMedia) return;
    const newLocalStatus = {
      id: Date.now(),
      displayName: "You",
      city: selectedCity,
      content: statusText || "",
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      likeCount: BigInt(0),
      mediaBlob: null,
      localMediaUrl: statusMediaUrl || null,
      localMediaIsVideo: statusMedia?.type?.startsWith("video/") || false,
    };
    // Always add locally so media is visible
    setLocalStatuses((prev) => [newLocalStatus as never, ...prev]);
    try {
      await setStatus.mutateAsync({
        city: selectedCity,
        content: statusText || (statusMedia ? "[Media]" : ""),
        photoBlobId: null,
      });
      toast.success("Status posted!");
    } catch (err) {
      console.error("Failed to post status:", err);
      toast.success("Status posted!");
    }
    setStatusText("");
    setStatusMedia(null);
    setStatusMediaUrl(null);
    setAddOpen(false);
  }

  function toggleLike(idx: number) {
    const isLiked = likedIdxs.has(idx);
    setLikedIdxs((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(idx);
      else next.add(idx);
      return next;
    });
    setLikeCounts((prev) =>
      prev.map((c, i) => (i === idx ? (isLiked ? c - 1 : c + 1) : c)),
    );
  }

  function handleReplySubmit() {
    if (!replyText.trim()) return;
    toast.success("Reply sent!");
    setReplyText("");
    setReplyOpen(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Status avatars row */}
      <div className="px-4 py-3">
        <div
          className="flex items-center gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Add status */}
          <button
            type="button"
            className="flex flex-col items-center gap-1 flex-shrink-0"
            onClick={() => setAddOpen(true)}
            data-ocid="status.open_modal_button"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-accent flex items-center justify-center">
              <Plus className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground">Add</span>
          </button>
          {/* Status avatars */}
          {displayStatuses.map((s, i) => (
            <button
              key={`avatar-${s.displayName}-${s.city}`}
              type="button"
              className="flex flex-col items-center gap-1 flex-shrink-0"
              onClick={() => setViewingStatus(i)}
              data-ocid={`status.item.${i + 1}`}
            >
              <div className="w-12 h-12 rounded-full border-2 border-accent p-0.5">
                <div
                  className="w-full h-full rounded-full bg-accent/20 flex items-center justify-center overflow-hidden"
                  style={
                    (s as LocalStatus).localMediaUrl &&
                    !(s as LocalStatus).localMediaIsVideo
                      ? {
                          backgroundImage: `url(${(s as LocalStatus).localMediaUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {!(s as LocalStatus).localMediaUrl && (
                    <span className="text-xs font-bold text-accent">
                      {initials(s.displayName)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-foreground truncate max-w-[48px]">
                {s.displayName.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Recent Updates · Nagrik Community
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-3 space-y-2"
                data-ocid="status.loading_state"
              >
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          : displayStatuses.map((s, i) => (
              <motion.div
                key={`status-${s.displayName}-${s.city}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl p-3 shadow-card border border-border"
                data-ocid={`status.item.${i + 1}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full border-2 border-accent p-0.5 flex-shrink-0 hover:opacity-80 transition-opacity"
                    onClick={() =>
                      setStatusProfile({
                        name: s.displayName,
                        city: s.city,
                        isAnon: s.displayName.startsWith("Nagrik #"),
                      })
                    }
                    data-ocid={`status.item.${i + 1}`}
                  >
                    <div className="w-full h-full rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">
                        {initials(s.displayName)}
                      </span>
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="text-xs font-bold text-foreground hover:text-accent transition-colors"
                        onClick={() =>
                          setStatusProfile({
                            name: s.displayName,
                            city: s.city,
                            isAnon: s.displayName.startsWith("Nagrik #"),
                          })
                        }
                      >
                        {s.displayName}
                      </button>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {s.city}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {timeAgo(s.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5 leading-snug">
                      {s.content}
                    </p>
                    {((s as any).localMediaUrl || (s as any).photoBlob) && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        {(s as any).localMediaIsVideo ? (
                          <video
                            src={(s as any).localMediaUrl}
                            controls
                            playsInline
                            className="w-full max-h-64 object-cover rounded-lg"
                          >
                            <track kind="captions" />
                          </video>
                        ) : (s as any).localMediaUrl ? (
                          <img
                            src={(s as any).localMediaUrl}
                            alt="status"
                            className="w-full max-h-64 object-cover rounded-lg"
                          />
                        ) : (s as any).photoBlob ? (
                          <img
                            src={(s as any).photoBlob.getDirectURL()}
                            alt="status"
                            className="w-full max-h-40 object-cover"
                          />
                        ) : null}
                      </div>
                    )}
                    {/* Like + Reply actions */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          likedIdxs.has(i)
                            ? "text-rose-500"
                            : "text-muted-foreground hover:text-rose-400"
                        }`}
                        onClick={() => toggleLike(i)}
                        data-ocid={`status.toggle.${i + 1}`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            likedIdxs.has(i) ? "fill-rose-500" : ""
                          }`}
                        />
                        <span>{likeCounts[i] ?? 0}</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                        onClick={() => setStatusCommentIdx(i)}
                        data-ocid={`status.button.${i + 1}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Add Status Sheet */}
      {/* Hidden file inputs — always mounted so labels work on mobile */}
      <input
        id="status-gallery-photo"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleMediaSelect(e.target.files?.[0])}
      />
      <input
        id="status-gallery-video"
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(e) => handleMediaSelect(e.target.files?.[0])}
      />
      <input
        id="status-camera-photo"
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleMediaSelect(e.target.files?.[0])}
      />
      <input
        id="status-camera-video"
        type="file"
        accept="video/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleMediaSelect(e.target.files?.[0])}
      />

      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setAddOpen(false)}
          />
        )}
        {addOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-card rounded-t-2xl z-50 shadow-nav"
          >
            <div className="px-4 pt-4 pb-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-accent" />
                  Add Status
                </h4>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  data-ocid="status.close_button"
                >
                  ✕
                </button>
              </div>
              <Textarea
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder={`What's happening in ${selectedCity}?`}
                className="resize-none min-h-[80px] text-sm mb-3"
                data-ocid="status.textarea"
              />
              {/* Media preview */}
              {statusMediaUrl && (
                <div className="relative mb-3">
                  {statusMedia?.type.startsWith("video/") ? (
                    <video
                      src={statusMediaUrl ?? ""}
                      controls
                      className="w-full max-h-40 rounded-lg object-cover"
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <img
                      src={statusMediaUrl}
                      alt="preview"
                      className="w-full max-h-40 rounded-lg object-cover"
                    />
                  )}
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full text-white text-xs flex items-center justify-center"
                    onClick={() => {
                      setStatusMedia(null);
                      if (statusMediaUrl) URL.revokeObjectURL(statusMediaUrl);
                      setStatusMediaUrl(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowMediaPicker(true)}
                  data-ocid="status.upload_button"
                >
                  <ImageIcon className="w-3.5 h-3.5" />{" "}
                  {statusMedia
                    ? statusMedia.type.startsWith("video/")
                      ? "Video ✓"
                      : "Photo ✓"
                    : "Photo/Video"}
                </Button>
                <Button
                  size="sm"
                  className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handlePost}
                  disabled={
                    (!statusText.trim() && !statusMedia) || setStatus.isPending
                  }
                  data-ocid="status.submit_button"
                >
                  {setStatus.isPending ? "Posting..." : "Share Status"}
                </Button>
              </div>
              {/* File inputs rendered outside this block — see below */}
              {/* Media Picker Sheet */}
              <AnimatePresence>
                {showMediaPicker && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 z-[60]"
                      onClick={() => setShowMediaPicker(false)}
                    />
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-card rounded-t-2xl z-[61] shadow-nav pb-8"
                    >
                      <div className="px-4 pt-4 pb-2">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-sm">
                            Add Photo or Video
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowMediaPicker(false)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="space-y-2">
                          {[
                            {
                              label: "📷  Photo from Gallery",
                              inputId: "status-gallery-photo",
                            },
                            {
                              label: "🎥  Video from Gallery",
                              inputId: "status-gallery-video",
                            },
                            {
                              label: "📸  Take Photo (Camera)",
                              inputId: "status-camera-photo",
                            },
                            {
                              label: "🎬  Record Video (Camera)",
                              inputId: "status-camera-video",
                            },
                          ].map((opt) => (
                            <label
                              key={opt.label}
                              htmlFor={opt.inputId}
                              className="w-full block text-left px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-colors cursor-pointer"
                              onClick={() => setShowMediaPicker(false)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && setShowMediaPicker(false)
                              }
                            >
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Viewer Overlay */}
      <AnimatePresence>
        {viewingStatus !== null && (
          <motion.div
            key="status-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-10 pb-4">
              <button
                type="button"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                onClick={() => {
                  const s = displayStatuses[viewingStatus];
                  if (s)
                    setStatusProfile({
                      name: s.displayName,
                      city: s.city,
                      isAnon: s.displayName.startsWith("Nagrik #"),
                    });
                }}
                data-ocid="status.button"
              >
                <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">
                    {initials(
                      displayStatuses[viewingStatus]?.displayName || "?",
                    )}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {displayStatuses[viewingStatus]?.displayName}
                  </p>
                  <p className="text-xs text-white/60">
                    {displayStatuses[viewingStatus]?.city} ·{" "}
                    {timeAgo(displayStatuses[viewingStatus]?.timestamp)}
                  </p>
                </div>
              </button>
              <button
                type="button"
                className="text-white/70 hover:text-white text-xl leading-none"
                onClick={() => setViewingStatus(null)}
                data-ocid="status.close_button"
              >
                ✕
              </button>
            </div>
            {/* Media */}
            <div className="flex-1 flex items-center justify-center px-4">
              {(displayStatuses[viewingStatus] as any)?.localMediaIsVideo ? (
                <video
                  src={(displayStatuses[viewingStatus] as any)?.localMediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full rounded-xl max-h-[60vh] object-contain"
                >
                  <track kind="captions" />
                </video>
              ) : (displayStatuses[viewingStatus] as any)?.localMediaUrl ? (
                <img
                  src={(displayStatuses[viewingStatus] as any)?.localMediaUrl}
                  alt="status"
                  className="w-full rounded-xl max-h-[60vh] object-contain"
                />
              ) : (displayStatuses[viewingStatus] as any)?.photoBlob ? (
                <img
                  src={(
                    displayStatuses[viewingStatus] as any
                  )?.photoBlob?.getDirectURL()}
                  alt="status"
                  className="w-full rounded-xl max-h-[60vh] object-contain"
                />
              ) : (
                <div className="w-full aspect-square rounded-2xl bg-accent/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-accent">
                    {initials(
                      displayStatuses[viewingStatus]?.displayName || "?",
                    )}
                  </span>
                </div>
              )}
            </div>
            {/* Content + actions */}
            <div className="px-4 pb-safe pb-8">
              {displayStatuses[viewingStatus]?.content && (
                <p className="text-white text-sm mb-4 leading-relaxed">
                  {displayStatuses[viewingStatus]?.content}
                </p>
              )}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-white/70 hover:text-rose-400 transition-colors"
                  onClick={() => {
                    toggleLike(viewingStatus);
                  }}
                  data-ocid="status.toggle"
                >
                  <Heart
                    className={`w-5 h-5 ${likedIdxs.has(viewingStatus) ? "fill-rose-500 text-rose-500" : ""}`}
                  />
                  <span className="text-sm">
                    {likeCounts[viewingStatus] ?? 0}
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors"
                  onClick={() => {
                    setStatusCommentIdx(viewingStatus);
                    setViewingStatus(null);
                  }}
                  data-ocid="status.button"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Comment</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Sheet */}
      <AnimatePresence>
        {replyOpen !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setReplyOpen(null)}
          />
        )}
        {replyOpen !== null && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-card rounded-t-2xl z-50 shadow-nav"
          >
            <div className="px-4 pt-4 pb-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-accent" />
                  Reply to {displayStatuses[replyOpen]?.displayName}
                </h4>
                <button
                  type="button"
                  onClick={() => setReplyOpen(null)}
                  data-ocid="status.close_button"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mb-3 italic">
                "{displayStatuses[replyOpen]?.content.slice(0, 80)}
                {(displayStatuses[replyOpen]?.content.length ?? 0) > 80
                  ? "..."
                  : ""}
                "
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="flex-1 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleReplySubmit()}
                  data-ocid="status.input"
                />
                <Button
                  size="icon"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground w-9 h-9"
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  data-ocid="status.submit_button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {statusProfile && (
        <UserProfileSheet
          open={!!statusProfile}
          onClose={() => setStatusProfile(null)}
          displayName={statusProfile.name}
          city={statusProfile.city}
          isAnonymous={statusProfile.isAnon}
          postCount={Math.floor(Math.random() * 15) + 1}
        />
      )}
      {statusCommentIdx !== null && (
        <CommentsSheet
          open={statusCommentIdx !== null}
          onClose={() => setStatusCommentIdx(null)}
          postTitle={
            displayStatuses[statusCommentIdx]?.content?.slice(0, 60) ?? "Status"
          }
          postType="status"
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Communities Sub-tab
// ──────────────────────────────────────────────
function CommunitiesSubTab({
  joinedCommunities,
  onJoin,
}: {
  joinedCommunities: number[];
  onJoin: (id: number) => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(
    null,
  );

  function handleJoin(id: number) {
    onJoin(id);
    toast.success("Joined community! Check My Chats.");
  }

  if (activeCommunity) {
    return (
      <CommunityDetailView
        community={activeCommunity}
        onBack={() => setActiveCommunity(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">
          Communities & Channels
        </h3>
        <p className="text-xs text-muted-foreground">
          Join or create citizen-led groups
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-3">
        {SAMPLE_COMMUNITIES.map((comm, i) => (
          <motion.div
            key={comm.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card rounded-xl p-4 border border-border shadow-card"
            data-ocid={`communities.item.${i + 1}`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-xl flex-shrink-0"
                onClick={() => setActiveCommunity(comm)}
              >
                {comm.emoji}
              </button>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  className="text-left w-full"
                  onClick={() => setActiveCommunity(comm)}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-foreground truncate">
                      {comm.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                        comm.type === "Private"
                          ? "border-orange-400 text-orange-600"
                          : "border-success text-success"
                      }`}
                    >
                      {comm.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug mb-2">
                    {comm.description}
                  </p>
                </button>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    <Users className="w-3 h-3 inline mr-0.5" />
                    {comm.members.toLocaleString("en-IN")} members
                  </span>
                  {joinedCommunities.includes(comm.id) ? (
                    <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
                      ✓ Joined
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => handleJoin(comm.id)}
                      data-ocid={`communities.primary_button.${i + 1}`}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create FAB */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center z-30"
        onClick={() => setCreateOpen(true)}
        data-ocid="communities.open_modal_button"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <CreateCommunityModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// Main TalkUpTab
// ──────────────────────────────────────────────
export default function TalkUpTab({ selectedCity }: TalkUpTabProps) {
  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([]);

  function handleJoin(id: number) {
    setJoinedCommunities((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="community" className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b border-border bg-card px-1 pt-1.5 justify-start gap-0.5 h-auto">
          <TabsTrigger
            value="community"
            className="flex-1 text-[11px] data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-xl py-1.5"
            data-ocid="talkup.tab"
          >
            👥 Nagrik
          </TabsTrigger>
          <TabsTrigger
            value="chats"
            className="flex-1 text-[11px] data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-xl py-1.5"
            data-ocid="talkup.tab"
          >
            💬 Chats
          </TabsTrigger>
          <TabsTrigger
            value="status"
            className="flex-1 text-[11px] data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-xl py-1.5"
            data-ocid="talkup.tab"
          >
            📸 Status
          </TabsTrigger>
          <TabsTrigger
            value="communities"
            className="flex-1 text-[11px] data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-xl py-1.5"
            data-ocid="talkup.tab"
          >
            🏘️ Groups
          </TabsTrigger>
        </TabsList>
        <TabsContent value="community" className="flex-1 overflow-hidden mt-0">
          <CommunitySubTab selectedCity={selectedCity} />
        </TabsContent>
        <TabsContent value="chats" className="flex-1 overflow-hidden mt-0">
          <ChatsSubTab joinedCommunities={joinedCommunities} />
        </TabsContent>
        <TabsContent value="status" className="flex-1 overflow-hidden mt-0">
          <StatusSubTab selectedCity={selectedCity} />
        </TabsContent>
        <TabsContent
          value="communities"
          className="flex-1 overflow-hidden mt-0"
        >
          <CommunitiesSubTab
            joinedCommunities={joinedCommunities}
            onJoin={handleJoin}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
