import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Camera,
  Heart,
  ImageIcon,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
    city: "Delhi",
    content:
      "Anyone else noticed that the garbage truck hasn't come in 3 days near Sector 7? Raising a report now.",
    likeCount: BigInt(17),
    timestamp: BigInt((Date.now() - 7_200_000) * 1_000_000),
    author: null as any,
  },
  {
    id: BigInt(3),
    displayName: "Priya Sharma",
    city: "Delhi",
    content:
      "Shoutout to the Shramdaan volunteers who cleaned Yamuna ghat this Sunday! Over 500 volunteers showed up 🙌",
    likeCount: BigInt(103),
    timestamp: BigInt((Date.now() - 86_400_000) * 1_000_000),
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
    city: "Delhi",
    content:
      "Just filed a road pothole complaint. Let's see how fast it gets resolved!",
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
];

interface WhatsuppTabProps {
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

// ——————————————————————————
// Community Sub-tab
// ——————————————————————————
function CommunitySubTab({ selectedCity }: { selectedCity: string }) {
  const [joinedBanner, setJoinedBanner] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [anonAlias, setAnonAlias] = useState(
    `Nagrik #${Math.floor(1000 + Math.random() * 9000)}`,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: posts, isLoading } = useCommunityPosts(selectedCity);
  const likeMutation = useLikeCommunityPost();
  const createPost = useCreateCommunityPost();

  const displayPosts =
    posts && posts.length > 0 ? posts : SAMPLE_COMMUNITY_POSTS;

  async function handlePost() {
    if (!postText.trim()) return;
    try {
      await createPost.mutateAsync({
        city: selectedCity,
        content: postText,
        mediaBlobId: null,
        displayName: isAnon ? anonAlias : undefined,
        anonymous: isAnon,
      });
      setPostText("");
      setSelectedFile(null);
      setComposeOpen(false);
      toast.success("Post shared to Nagrik community!");
    } catch {
      toast.error("Could not post. Try again.");
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

      <div className="px-4 mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Nagrik Community
          </h3>
          <p className="text-xs text-muted-foreground">
            {selectedCity} · Public feed
          </p>
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
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-accent/10 text-accent font-bold">
                      {initials(post.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {post.displayName}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {post.city}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {timeAgo(post.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-snug">
                      {post.content}
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
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => likeMutation.mutate(post.id)}
                        data-ocid={`community.toggle.${idx + 1}`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{post.likeCount.toString()}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
                placeholder="Share something with your community..."
                className="resize-none min-h-[80px] text-sm mb-3"
                data-ocid="community.textarea"
              />
              <div className="flex items-center gap-2 mb-3">
                <Switch
                  checked={isAnon}
                  onCheckedChange={setIsAnon}
                  id="anon-toggle"
                  data-ocid="community.switch"
                />
                <label
                  htmlFor="anon-toggle"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Post anonymously
                </label>
              </div>
              {isAnon && (
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
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                  onClick={() => fileRef.current?.click()}
                  data-ocid="community.upload_button"
                >
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                {selectedFile && (
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {selectedFile.name}
                  </span>
                )}
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
    </div>
  );
}

// ——————————————————————————
// Chats Sub-tab
// ——————————————————————————
function ChatsSubTab() {
  const [activeConvo, setActiveConvo] = useState<Principal | null>(null);
  const [msgText, setMsgText] = useState("");

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
      <div className="px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">Private Chats</h3>
        <p className="text-xs text-muted-foreground">1-on-1 with any citizen</p>
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
    </div>
  );
}

// ——————————————————————————
// Status Sub-tab
// ——————————————————————————
function StatusSubTab({ selectedCity }: { selectedCity: string }) {
  const [statusText, setStatusText] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const { data: statuses, isLoading } = useStatuses(selectedCity);
  const setStatus = useSetStatus();

  const displayStatuses =
    statuses && statuses.length > 0 ? statuses : SAMPLE_STATUSES;

  async function handlePost() {
    if (!statusText.trim()) return;
    try {
      await setStatus.mutateAsync({
        city: selectedCity,
        content: statusText,
        photoBlobId: null,
      });
      setStatusText("");
      setAddOpen(false);
      toast.success("Status posted!");
    } catch {
      toast.error("Failed to post status");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Status avatars row */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
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
            <div
              key={`avatar-${s.displayName}-${s.city}`}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              data-ocid={`status.item.${i + 1}`}
            >
              <div className="w-12 h-12 rounded-full border-2 border-accent p-0.5">
                <div className="w-full h-full rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">
                    {initials(s.displayName)}
                  </span>
                </div>
              </div>
              <span className="text-xs text-foreground truncate max-w-[48px]">
                {s.displayName.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Recent Updates · {selectedCity}
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
                key={`status-${s.displayName}-${s.city}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl p-3 shadow-card border border-border flex items-start gap-3"
                data-ocid={`status.item.${i + 1}`}
              >
                <div className="w-9 h-9 rounded-full border-2 border-accent p-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">
                      {initials(s.displayName)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-foreground">
                      {s.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(s.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5 leading-snug">
                    {s.content}
                  </p>
                  {s.photoBlob && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <img
                        src={s.photoBlob.getDirectURL()}
                        alt="status"
                        className="w-full max-h-40 object-cover"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
      </div>

      {/* Add Status Modal */}
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  data-ocid="status.upload_button"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Photo
                </Button>
                <Button
                  size="sm"
                  className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handlePost}
                  disabled={!statusText.trim() || setStatus.isPending}
                  data-ocid="status.submit_button"
                >
                  {setStatus.isPending ? "Posting..." : "Share Status"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ——————————————————————————
// Main WhatsuppTab
// ——————————————————————————
export default function WhatsuppTab({ selectedCity }: WhatsuppTabProps) {
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="community" className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b border-border bg-card px-2 pt-2 justify-start gap-1 h-auto">
          <TabsTrigger
            value="community"
            className="flex-1 text-xs data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-xl py-2"
            data-ocid="whatsapp.tab"
          >
            👥 Nagrik
          </TabsTrigger>
          <TabsTrigger
            value="chats"
            className="flex-1 text-xs data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-xl py-2"
            data-ocid="whatsapp.tab"
          >
            💬 Chats
          </TabsTrigger>
          <TabsTrigger
            value="status"
            className="flex-1 text-xs data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-xl py-2"
            data-ocid="whatsapp.tab"
          >
            📸 Status
          </TabsTrigger>
        </TabsList>
        <TabsContent value="community" className="flex-1 overflow-hidden mt-0">
          <CommunitySubTab selectedCity={selectedCity} />
        </TabsContent>
        <TabsContent value="chats" className="flex-1 overflow-hidden mt-0">
          <ChatsSubTab />
        </TabsContent>
        <TabsContent value="status" className="flex-1 overflow-hidden mt-0">
          <StatusSubTab selectedCity={selectedCity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
