import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Heart, MapPin, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCommunityPosts, usePublicIssues } from "../hooks/useQueries";

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    infrastructure: "bg-orange-100 text-orange-700",
    sanitation: "bg-emerald-100 text-emerald-700",
    healthcare: "bg-red-100 text-red-700",
    publicSafety: "bg-blue-100 text-blue-700",
    corruption: "bg-yellow-100 text-yellow-700",
    other: "bg-gray-100 text-gray-600",
  };
  return map[cat] ?? "bg-gray-100 text-gray-600";
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    infrastructure: "Infrastructure",
    sanitation: "Sanitation",
    healthcare: "Healthcare",
    publicSafety: "Public Safety",
    corruption: "Corruption",
    other: "Other",
  };
  return map[cat] ?? cat;
}

function timeAgo(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

interface ProfileOverlayProps {
  open: boolean;
  onClose: () => void;
  selectedCity: string;
}

export default function ProfileOverlay({
  open,
  onClose,
  selectedCity,
}: ProfileOverlayProps) {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: allIssues, isLoading: issuesLoading } = usePublicIssues();
  const { data: allPosts, isLoading: postsLoading } = useCommunityPosts("");

  const myReports = (allIssues ?? []).filter(
    (issue) => issue.reporter?.toString() === myPrincipal,
  );

  const myPosts = (allPosts ?? []).filter(
    (post) => post.author?.toString() === myPrincipal,
  );

  const displayName = myPrincipal
    ? `Nagrik ${myPrincipal.slice(0, 8)}…`
    : "Guest Nagrik";
  const avatarInitial = myPrincipal ? myPrincipal[0].toUpperCase() : "G";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
          data-ocid="profile.modal"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              data-ocid="profile.close_button"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-base font-bold text-foreground">
              My Profile
            </span>
          </div>

          {/* Avatar + Info */}
          <div className="px-4 py-5 bg-card border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-saffron flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-black text-2xl">
                  {avatarInitial}
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {myPrincipal ? "Internet Identity" : "Guest"} · {selectedCity}
                </p>
                <div className="flex gap-1.5 mt-1.5">
                  <Badge
                    variant="outline"
                    className="text-xs border-success text-success px-2 py-0"
                  >
                    Verified Nagrik
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-accent text-accent px-2 py-0"
                  >
                    {myReports.length} Reports
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="reports"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full rounded-none border-b border-border bg-card grid grid-cols-2 h-10">
              <TabsTrigger
                value="reports"
                className="text-xs rounded-none"
                data-ocid="profile.tab"
              >
                My Reports
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="text-xs rounded-none"
                data-ocid="profile.tab"
              >
                My Posts
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="reports"
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 mt-0"
            >
              {issuesLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : myReports.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  data-ocid="profile.empty_state"
                >
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    No reports yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your civic reports will appear here
                  </p>
                </div>
              ) : (
                myReports.map((r, i) => (
                  <motion.div
                    key={r.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-xl border border-border p-3 shadow-sm"
                    data-ocid={`profile.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor(r.category)}`}
                      >
                        {categoryLabel(r.category)}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{timeAgo(r.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug mb-2">
                      {r.title}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs truncate max-w-[140px]">
                          {r.gpsLocation}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-accent ml-auto">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">
                          {r.upvotes.toString()} upvotes
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent
              value="posts"
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 mt-0"
            >
              {postsLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : myPosts.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  data-ocid="profile.empty_state"
                >
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    No posts yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your community posts will appear here
                  </p>
                </div>
              ) : (
                myPosts.map((p, i) => (
                  <motion.div
                    key={p.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-xl border border-border p-3 shadow-sm"
                    data-ocid={`profile.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full gradient-saffron flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {p.displayName?.[0]?.toUpperCase() ?? "N"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {p.displayName || displayName}
                        </p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-2.5 h-2.5" />
                          <span className="text-xs">
                            {p.city} · {timeAgo(p.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-snug mb-2">
                      {p.content}
                    </p>
                    <div className="flex items-center gap-1 text-rose-500">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      <span className="text-xs font-bold">
                        {p.likeCount.toString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
