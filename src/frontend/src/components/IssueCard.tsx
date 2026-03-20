import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Edit2,
  MapPin,
  MessageCircle,
  MoreVertical,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Issue } from "../hooks/useQueries";
import { IssueCategory } from "../hooks/useQueries";
import CommentsSheet from "./CommentsSheet";
import UserProfileSheet from "./UserProfileSheet";

const CATEGORY_CONFIG: Record<
  IssueCategory,
  { label: string; color: string; bg: string }
> = {
  [IssueCategory.healthcare]: {
    label: "Healthcare",
    color: "text-rose-700",
    bg: "bg-rose-50",
  },
  [IssueCategory.publicSafety]: {
    label: "Public Safety",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  [IssueCategory.other]: {
    label: "Other",
    color: "text-gray-700",
    bg: "bg-gray-100",
  },
  [IssueCategory.corruption]: {
    label: "Corruption",
    color: "text-red-800",
    bg: "bg-red-50",
  },
  [IssueCategory.sanitation]: {
    label: "Sanitation",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  [IssueCategory.infrastructure]: {
    label: "Infrastructure",
    color: "text-orange-700",
    bg: "bg-orange-50",
  },
};

function timeAgo(timestamp: bigint): string {
  const diffMs = Date.now() - Number(timestamp) / 1_000_000;
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffHrs > 24) return `${Math.floor(diffHrs / 24)}d ago`;
  if (diffHrs > 0) return `${diffHrs}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "Just now";
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const DOWNVOTES_KEY = "loksetu_downvotes";

function loadDownvotes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(DOWNVOTES_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDownvotes(data: Record<string, number>) {
  try {
    localStorage.setItem(DOWNVOTES_KEY, JSON.stringify(data));
  } catch {}
}

interface IssueCardProps {
  issue: Issue;
  index: number;
  onUpvote: (id: bigint) => void;
  isUpvoting?: boolean;
  isOwner?: boolean;
  onDelete?: (id: bigint) => void;
  onEdit?: (id: bigint, newTitle: string, newDesc: string) => void;
}

export default function IssueCard({
  issue,
  index,
  onUpvote,
  isOwner,
  onDelete,
  onEdit,
}: IssueCardProps) {
  const [liked, setLiked] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(Number(issue.upvotes));
  const [disliked, setDisliked] = useState(false);
  const [localDownvotes, setLocalDownvotes] = useState(() => {
    const store = loadDownvotes();
    return store[issue.id.toString()] ?? 0;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount] = useState(Math.floor(Math.random() * 8) + 1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(issue.title);
  const [editDesc, setEditDesc] = useState(issue.description);

  const catConfig =
    CATEGORY_CONFIG[issue.category] ?? CATEGORY_CONFIG[IssueCategory.other];

  const isAnon =
    issue.isVigilance ||
    (() => {
      try {
        return issue.reporter?.isAnonymous?.() ?? false;
      } catch {
        return false;
      }
    })();

  const reporterName = isAnon
    ? "Anonymous Citizen"
    : (() => {
        const txt = issue.reporter?.toText?.() ?? "";
        if (txt === "me" || txt.length < 4) return "You";
        if (txt.includes("-")) return "Citizen";
        return "Citizen";
      })();

  const cityMatch = issue.gpsLocation.match(/([A-Z][a-z]+)/);
  const city = cityMatch ? cityMatch[1] : "India";

  function handleUpvote() {
    setLiked((prev) => {
      const next = !prev;
      setLocalUpvotes((c) => c + (next ? 1 : -1));
      return next;
    });
    onUpvote(issue.id);
  }

  function handleDownvote() {
    setDisliked((prev) => {
      const next = !prev;
      const newCount = localDownvotes + (next ? 1 : -1);
      setLocalDownvotes(newCount);
      const store = loadDownvotes();
      store[issue.id.toString()] = newCount;
      saveDownvotes(store);
      return next;
    });
  }

  function handleSaveEdit() {
    onEdit?.(issue.id, editTitle, editDesc);
    setEditMode(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        data-ocid={`nagrik.item.${index + 1}`}
        className="bg-card rounded-xl shadow-card overflow-hidden border border-border"
      >
        {issue.photoBlob && (
          <div className="h-36 bg-muted overflow-hidden">
            <img
              src={issue.photoBlob.getDirectURL()}
              alt={issue.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        {(issue as any).localMediaUrl && (
          <div className="h-36 bg-muted overflow-hidden">
            {(issue as any).localMediaIsVideo ? (
              // biome-ignore lint/a11y/useMediaCaption: local civic video
              <video
                src={(issue as any).localMediaUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={(issue as any).localMediaUrl}
                alt={issue.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
        )}

        <div className="p-3">
          {/* Poster header */}
          <div className="flex items-start gap-2 mb-2.5">
            <button
              type="button"
              className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
              onClick={() => setProfileOpen(true)}
              data-ocid={`nagrik.item.${index + 1}`}
            >
              {isAnon ? (
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full gradient-saffron flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {initials(reporterName)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">
                    {reporterName}
                  </span>
                  {isAnon && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Anon
                    </span>
                  )}
                  <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {city}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{timeAgo(issue.timestamp)}</span>
              </div>
            </button>

            {/* 3-dot owner menu */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
                    data-ocid={`nagrik.item.${index + 1}`}
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => setEditMode(true)}
                    data-ocid={`nagrik.item.${index + 1}`}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    data-ocid={`nagrik.item.${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Edit form */}
          {editMode ? (
            <div className="mb-3 space-y-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-sm"
                placeholder="Title"
                data-ocid={`nagrik.item.${index + 1}`}
              />
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="text-sm resize-none"
                rows={3}
                placeholder="Description"
                data-ocid={`nagrik.item.${index + 1}`}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSaveEdit}
                  data-ocid={`nagrik.item.${index + 1}`}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setEditMode(false)}
                  data-ocid={`nagrik.item.${index + 1}`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${catConfig.bg} ${catConfig.color}`}
                >
                  {catConfig.label}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-card-foreground leading-snug mb-1">
                {editTitle}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {editDesc}
              </p>
            </>
          )}

          <div className="flex items-center gap-1 text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs truncate">{issue.gpsLocation}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`h-8 text-xs gap-1.5 transition-colors ${
                  liked
                    ? "bg-success border-success text-success-foreground hover:bg-success/90"
                    : "border-success text-success hover:bg-success hover:text-success-foreground"
                }`}
                onClick={handleUpvote}
                data-ocid={`nagrik.item.${index + 1}`}
              >
                <ThumbsUp
                  className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`}
                />
                {liked ? "Reported" : "I face this too"}
              </Button>
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setCommentsOpen(true)}
                data-ocid={`nagrik.item.${index + 1}`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{commentCount}</span>
              </button>
            </div>
            {/* Vote counts */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <ThumbsUp
                  className={`w-3.5 h-3.5 ${liked ? "fill-success" : ""} text-success`}
                />
                <span className="text-sm font-bold text-success">
                  {localUpvotes}
                </span>
              </div>
              <button
                type="button"
                className={`flex items-center gap-1 text-sm font-bold transition-colors ${
                  disliked
                    ? "text-destructive"
                    : "text-muted-foreground hover:text-destructive"
                }`}
                onClick={handleDownvote}
                data-ocid={`nagrik.toggle.${index + 1}`}
              >
                <ThumbsDown
                  className={`w-3.5 h-3.5 ${
                    disliked ? "fill-destructive text-destructive" : ""
                  }`}
                />
                <span>{localDownvotes}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This report will be removed from the feed and your profile. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid={`nagrik.item.${index + 1}`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete?.(issue.id);
                setDeleteDialogOpen(false);
              }}
              data-ocid={`nagrik.item.${index + 1}`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        displayName={reporterName}
        city={city}
        isAnonymous={isAnon}
        postCount={commentCount + 2}
      />

      <CommentsSheet
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postTitle={issue.title}
        postType="report"
      />
    </>
  );
}
