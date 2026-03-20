import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Shield, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import type { Issue } from "../hooks/useQueries";
import { IssueCategory } from "../hooks/useQueries";

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

interface IssueCardProps {
  issue: Issue;
  index: number;
  onUpvote: (id: bigint) => void;
  isUpvoting?: boolean;
}

export default function IssueCard({
  issue,
  index,
  onUpvote,
  isUpvoting,
}: IssueCardProps) {
  const catConfig =
    CATEGORY_CONFIG[issue.category] ?? CATEGORY_CONFIG[IssueCategory.other];

  return (
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

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${catConfig.bg} ${catConfig.color}`}
          >
            {catConfig.label}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{timeAgo(issue.timestamp)}</span>
          </div>
        </div>

        <h3 className="font-semibold text-sm text-card-foreground leading-snug mb-1">
          {issue.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {issue.description}
        </p>

        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs truncate">{issue.gpsLocation}</span>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-success text-success hover:bg-success hover:text-success-foreground"
            onClick={() => onUpvote(issue.id)}
            disabled={isUpvoting}
            data-ocid={`nagrik.item.${index + 1}`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />I face this too
          </Button>
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5 text-accent" />
            <span className="text-sm font-bold text-accent">
              {issue.upvotes.toString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
