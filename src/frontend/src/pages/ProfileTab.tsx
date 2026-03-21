import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Camera,
  Edit2,
  FileText,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { UserRole, useCallerRole, useUserStats } from "../hooks/useQueries";
import {
  type MyPost,
  type MyReport,
  deletePost as activityDeletePost,
  deleteReport as activityDeleteReport,
  getPosts,
  getReports,
} from "../store/appActivity";
import { useAppStore } from "../store/appStore";

const MAX_REPORTS = 50;

function timeAgo(timestamp: bigint | number): string {
  const diffMs =
    typeof timestamp === "number"
      ? Date.now() - timestamp
      : Date.now() - Number(timestamp) / 1_000_000;
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffHrs > 24) return `${Math.floor(diffHrs / 24)}d ago`;
  if (diffHrs > 0) return `${diffHrs}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "Just now";
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface ProfileTabProps {
  userName: string;
  userAvatar: string;
  onNameChange: (name: string) => void;
  onAvatarChange: (dataUrl: string) => void;
}

export default function ProfileTab({
  userName,
  userAvatar,
  onNameChange,
  onAvatarChange,
}: ProfileTabProps) {
  const { data: role, isLoading: roleLoading } = useCallerRole();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [guestMode, setGuestMode] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Keep nameInput in sync if userName changes externally
  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  const { deleteReport: storeDeleteReport, deletePost: storeDeletePost } =
    useAppStore();

  const [activityReports, setActivityReports] = useState<MyReport[]>(() =>
    getReports(),
  );
  const [activityPosts, setActivityPosts] = useState<MyPost[]>(() =>
    getPosts(),
  );

  useEffect(() => {
    function reload() {
      setActivityReports(getReports());
      setActivityPosts(getPosts());
    }
    window.addEventListener("focus", reload);
    window.addEventListener("loksetu:activity", reload);
    document.addEventListener("visibilitychange", reload);
    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("loksetu:activity", reload);
      document.removeEventListener("visibilitychange", reload);
    };
  }, []);

  const mergedReports = activityReports.length > 0 ? activityReports : [];
  const mergedPosts = activityPosts.length > 0 ? activityPosts : [];

  function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    onNameChange(trimmed);
    setEditingName(false);
    toast.success("Name updated!");
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        onAvatarChange(dataUrl);
        toast.success("Profile photo updated!");
      }
    };
    reader.readAsDataURL(file);
    // Reset so same file can be chosen again
    e.target.value = "";
  }

  function handleDeleteReport(id: string) {
    activityDeleteReport(id);
    setActivityReports(getReports());
    try {
      storeDeleteReport(BigInt(id));
    } catch {}
    toast.success("Report removed from profile");
  }

  function handleDeletePost(id: string) {
    activityDeletePost(id);
    setActivityPosts(getPosts());
    try {
      storeDeletePost(BigInt(id));
    } catch {}
    toast.success("Post removed from profile");
  }

  const isGuest =
    guestMode ||
    role === UserRole.guest ||
    (!identity && !roleLoading && !guestMode);
  const reportsCount =
    mergedReports.length > 0
      ? mergedReports.length
      : Number(stats?.reportsCount ?? 0);
  const progressPct = Math.min((reportsCount / MAX_REPORTS) * 100, 100);
  const certificateUnlocked =
    stats?.unlockedCertificate ?? reportsCount >= MAX_REPORTS;

  if (roleLoading) {
    return (
      <div className="p-4 space-y-4" data-ocid="profile.loading_state">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full gradient-saffron flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🏛️</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Loksetu</h2>
            <p className="text-sm text-muted-foreground text-center">
              Your civic companion — report issues,
              <br />
              earn recognition, build a better India.
            </p>
          </div>

          <div className="space-y-3 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                className="w-full h-13 bg-primary hover:bg-primary/90 text-primary-foreground gap-3 text-sm font-semibold py-4 rounded-xl shadow-md"
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                data-ocid="profile.primary_button"
              >
                {loginStatus === "logging-in" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                {loginStatus === "logging-in"
                  ? "Connecting..."
                  : "Login with Internet Identity"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-1.5">
                🔒 Secure · ICP-native · No password needed
              </p>
            </motion.div>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="outline"
                className="w-full h-13 gap-3 text-sm font-semibold py-4 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5"
                onClick={() => {
                  setGuestMode(true);
                  toast.success(
                    "Browsing as Guest — your data won't be saved.",
                  );
                }}
                data-ocid="profile.secondary_button"
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Continue as Guest</span>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-1.5">
                Browse only · Posts & reports won't be saved
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {/* Hidden file input for avatar upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
        aria-label="Upload profile photo"
      />

      {/* User Avatar + Name */}
      <div className="gradient-saffron mx-4 mt-4 rounded-2xl p-4 text-white mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar — tap to change photo */}
          <button
            type="button"
            className="relative flex-shrink-0 group"
            onClick={() => avatarInputRef.current?.click()}
            title="Change profile photo"
          >
            <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center text-2xl font-bold overflow-hidden">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(userName) || "N"}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </button>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  className="h-8 text-sm text-foreground"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                  data-ocid="profile.input"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-3"
                  onClick={handleSaveName}
                  data-ocid="profile.save_button"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={() => {
                    setEditingName(false);
                    setNameInput(userName);
                  }}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base truncate">{userName}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(userName);
                    setEditingName(true);
                  }}
                  data-ocid="profile.edit_button"
                >
                  <Edit2 className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            )}
            <p className="text-xs opacity-80 mt-0.5">
              {identity
                ? `${identity.getPrincipal().toString().slice(0, 20)}...`
                : "Guest Mode"}
            </p>
          </div>
        </div>
      </div>

      {/* My Reports + My Posts Tabs */}
      <div className="mx-4 mb-4">
        <Tabs defaultValue="reports">
          <TabsList className="w-full">
            <TabsTrigger
              value="reports"
              className="flex-1 gap-1.5"
              data-ocid="profile.tab"
            >
              <FileText className="w-3.5 h-3.5" />
              My Reports ({mergedReports.length})
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="flex-1 gap-1.5"
              data-ocid="profile.tab"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              My Posts ({mergedPosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-3 space-y-2">
            {mergedReports.length === 0 ? (
              <div className="text-center py-8" data-ocid="profile.empty_state">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm text-muted-foreground">
                  You haven't reported any issues yet.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tap the + button in the Nagrik tab to report a civic issue.
                </p>
              </div>
            ) : (
              mergedReports.map((report, idx) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-card rounded-xl border border-border p-3"
                  data-ocid={`profile.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {report.category.replace(/[{}]/g, "") || "Issue"}
                        </Badge>
                        {report.city && (
                          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            📍 {report.city}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {timeAgo(report.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {report.title}
                      </p>
                      {report.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {report.description}
                        </p>
                      )}
                      {report.mediaType === "video" && report.mediaUrl && (
                        // biome-ignore lint/a11y/useMediaCaption: user-uploaded civic report video
                        <video
                          src={report.mediaUrl}
                          controls
                          playsInline
                          className="w-full rounded-lg mt-2 max-h-48 object-cover"
                        />
                      )}
                      {report.mediaType === "photo" && report.mediaUrl && (
                        <img
                          src={report.mediaUrl}
                          alt="report media"
                          className="w-full rounded-lg mt-2 max-h-48 object-cover"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      onClick={() => handleDeleteReport(report.id)}
                      data-ocid={`profile.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-3 space-y-2">
            {mergedPosts.length === 0 ? (
              <div className="text-center py-8" data-ocid="profile.empty_state">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-sm text-muted-foreground">
                  You haven't made any posts yet.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Post in the TalkUp community or Nagrik tab.
                </p>
              </div>
            ) : (
              mergedPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-card rounded-xl border border-border p-3"
                  data-ocid={`profile.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground">
                          {post.community}
                        </span>
                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          {post.city}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {timeAgo(post.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-snug">
                        {post.text}
                      </p>
                      {post.mediaType === "video" && post.mediaUrl && (
                        // biome-ignore lint/a11y/useMediaCaption: user-uploaded community post video
                        <video
                          src={post.mediaUrl}
                          controls
                          playsInline
                          className="w-full rounded-lg mt-2 max-h-48 object-cover"
                        />
                      )}
                      {post.mediaType === "photo" && post.mediaUrl && (
                        <img
                          src={post.mediaUrl}
                          alt="post media"
                          className="w-full rounded-lg mt-2 max-h-48 object-cover"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      onClick={() => handleDeletePost(post.id)}
                      data-ocid={`profile.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Milestone Tracker */}
      <div className="mx-4 mb-4 bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">
            🏆 Milestone Tracker
          </h3>
          <span className="text-xs text-muted-foreground">Satark Nagrik</span>
        </div>
        {statsLoading ? (
          <Skeleton className="h-6 w-full" data-ocid="profile.loading_state" />
        ) : (
          <>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span className="font-medium text-foreground">
                {reportsCount} / {MAX_REPORTS} Verified Reports
              </span>
              <span className="text-accent font-semibold">
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="relative w-full h-3 bg-primary/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-accent rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {MAX_REPORTS - reportsCount > 0
                ? `${MAX_REPORTS - reportsCount} more reports to unlock certificate`
                : "🎉 Certificate unlocked!"}
            </p>
          </>
        )}
      </div>

      {/* Certificate Card */}
      <div className="mx-4 mb-4">
        <h3 className="text-sm font-bold text-foreground mb-2">
          📜 Satark Nagrik Pramanpatra
        </h3>
        <div
          className={`rounded-xl p-4 border-2 ${
            certificateUnlocked
              ? "border-success bg-success/5"
              : "border-border bg-muted/50"
          }`}
          data-ocid="profile.card"
        >
          {certificateUnlocked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-success" />
              </div>
              <div>
                <p className="font-bold text-success text-sm">
                  Certificate Unlocked! 🎉
                </p>
                <p className="text-xs text-success/80">
                  Satark Nagrik Pramanpatra
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {userName} | {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Lock className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-muted-foreground text-sm">
                  Certificate Locked
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete 50 verified reports to unlock the Good Citizen
                  Certificate
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="mx-4 bg-card rounded-xl border border-border overflow-hidden shadow-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Settings
          </p>
        </div>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
          onClick={() => {
            setNameInput(userName);
            setEditingName(true);
          }}
          data-ocid="profile.edit_button"
        >
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Edit Display Name</span>
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left border-t border-border"
          onClick={() => avatarInputRef.current?.click()}
          data-ocid="profile.edit_button"
        >
          <Camera className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Change Profile Photo</span>
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-destructive/5 transition-colors text-left border-t border-border"
          onClick={() => {
            clear();
            setGuestMode(false);
            toast.success("Logged out successfully");
          }}
          data-ocid="profile.delete_button"
        >
          <LogOut className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">Logout</span>
        </button>
      </div>
    </div>
  );
}
