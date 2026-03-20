import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Plus, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import IssueCard from "../components/IssueCard";
import ReportIssueModal from "../components/ReportIssueModal";
import {
  IssueCategory,
  useCreateIssue,
  usePublicIssues,
  useUpvoteIssue,
} from "../hooks/useQueries";
import type { Issue } from "../hooks/useQueries";

const SAMPLE_ISSUES: Issue[] = [
  {
    id: BigInt(1),
    title: "Pothole on MG Road near bus stand",
    description:
      "Large pothole has formed after heavy rains. Two-wheelers are at risk of accidents.",
    gpsLocation: "28.6129° N, 77.2295° E",
    category: IssueCategory.infrastructure,
    upvotes: BigInt(24),
    timestamp: BigInt((Date.now() - 7_200_000) * 1_000_000),
    isVigilance: false,
    reporter: { isAnonymous: () => false, toText: () => "aaaa-bbbbb" } as any,
  },
  {
    id: BigInt(2),
    title: "Garbage pile-up at Sector 12 corner",
    description:
      "Sanitation truck hasn't come for 5 days. Foul smell and health hazard.",
    gpsLocation: "28.6200° N, 77.2100° E",
    category: IssueCategory.sanitation,
    upvotes: BigInt(18),
    timestamp: BigInt((Date.now() - 18_000_000) * 1_000_000),
    isVigilance: false,
    reporter: { isAnonymous: () => false, toText: () => "cccc-ddddd" } as any,
  },
  {
    id: BigInt(3),
    title: "Streetlight broken near Ramlila Ground",
    description:
      "Multiple streetlights non-functional since last week, causing safety concerns at night.",
    gpsLocation: "28.6350° N, 77.2450° E",
    category: IssueCategory.publicSafety,
    upvotes: BigInt(9),
    timestamp: BigInt((Date.now() - 86_400_000) * 1_000_000),
    isVigilance: false,
    reporter: { isAnonymous: () => false, toText: () => "eeee-fffff" } as any,
  },
  {
    id: BigInt(4),
    title: "Water leakage on Civil Lines Road",
    description:
      "Municipal water pipe burst, flooding the road and wasting water.",
    gpsLocation: "28.6440° N, 77.2210° E",
    category: IssueCategory.infrastructure,
    upvotes: BigInt(31),
    timestamp: BigInt((Date.now() - 3_600_000) * 1_000_000),
    isVigilance: false,
    reporter: { isAnonymous: () => false, toText: () => "gggg-hhhhh" } as any,
  },
];

export default function NagrikTab() {
  const [reportOpen, setReportOpen] = useState(false);
  const [vigilanceOpen, setVigilanceOpen] = useState(false);
  const [vigilanceActive, setVigilanceActive] = useState(false);

  const { data: issues, isLoading } = usePublicIssues();
  const createIssue = useCreateIssue();
  const upvoteIssue = useUpvoteIssue();

  const displayIssues: Issue[] =
    issues && issues.length > 0 ? issues : SAMPLE_ISSUES;

  async function handleSubmit(
    data: Parameters<typeof createIssue.mutateAsync>[0],
  ) {
    try {
      await createIssue.mutateAsync(data);
      toast.success(
        data.isVigilance
          ? "Vigilance report submitted anonymously"
          : "Issue reported successfully!",
      );
      setReportOpen(false);
      setVigilanceOpen(false);
      setVigilanceActive(false);
    } catch {
      toast.error("Failed to submit report. Please try again.");
    }
  }

  async function handleUpvote(id: bigint) {
    try {
      await upvoteIssue.mutateAsync(id);
      toast.success("Upvoted!");
    } catch {
      toast.error("Could not upvote");
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Hero Banner */}
      <div className="gradient-saffron rounded-2xl mx-4 mt-4 mb-3 px-4 py-4 text-white">
        <h2 className="text-xl font-bold leading-tight">Welcome, Nagrik! 🇮🇳</h2>
        <p className="text-sm opacity-90 mt-0.5">
          Your Civic Super App for a Better Community.
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1">
            <Info className="w-3 h-3" />
            <span className="text-xs font-medium">AI Verification Active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1">
            <Info className="w-3 h-3" />
            <span className="text-xs font-medium">30-Day Auto-Escalation</span>
          </div>
        </div>
      </div>

      {/* Vigilance Mode Button */}
      <div className="px-4 mb-3">
        <button
          type="button"
          className="w-full border-2 border-destructive rounded-xl px-4 py-3 flex items-center justify-between bg-destructive/5 hover:bg-destructive/10 transition-colors"
          onClick={() => {
            setVigilanceActive(true);
            setVigilanceOpen(true);
          }}
          data-ocid="nagrik.toggle"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            <div className="text-left">
              <div className="text-sm font-bold text-destructive">
                Vigilance Mode
              </div>
              <div className="text-xs text-muted-foreground">
                High-Stakes Reporting (Corruption / VIP Violations)
              </div>
            </div>
          </div>
          <div className="text-destructive text-lg">→</div>
        </button>
      </div>

      <AnimatePresence>
        {vigilanceActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2.5">
              <Shield className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-xs text-destructive font-semibold">
                ⚠️ Extreme Anonymity is Active — Report bypasses public feed
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Feed */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Community Feed</h3>
        <span className="text-xs text-muted-foreground">
          {displayIssues.length} issues nearby
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((skId) => (
              <div
                key={skId}
                className="bg-card rounded-xl p-3 space-y-2"
                data-ocid="nagrik.loading_state"
              >
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          : displayIssues.map((issue, index) => (
              <IssueCard
                key={issue.id.toString()}
                issue={issue}
                index={index}
                onUpvote={handleUpvote}
                isUpvoting={upvoteIssue.isPending}
              />
            ))}

        {!isLoading && displayIssues.length === 0 && (
          <div className="text-center py-12" data-ocid="nagrik.empty_state">
            <div className="text-4xl mb-3">🏙️</div>
            <p className="text-muted-foreground text-sm">
              No issues reported yet.
            </p>
            <p className="text-muted-foreground text-xs">
              Be the first to report!
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-success text-success-foreground shadow-lg flex items-center justify-center z-30"
        onClick={() => setReportOpen(true)}
        data-ocid="nagrik.open_modal_button"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Report Modal */}
      <ReportIssueModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmit}
        isVigilance={false}
        isSubmitting={createIssue.isPending}
      />

      {/* Vigilance Modal */}
      <ReportIssueModal
        open={vigilanceOpen}
        onClose={() => {
          setVigilanceOpen(false);
          setVigilanceActive(false);
        }}
        onSubmit={handleSubmit}
        isVigilance={true}
        isSubmitting={createIssue.isPending}
      />
    </div>
  );
}
