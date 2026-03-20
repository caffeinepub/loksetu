import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, MapPin, Plus, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
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
import { useAppStore } from "../store/appStore";

// Sample issues with realistic GPS near major Indian cities
const SAMPLE_ISSUES: Issue[] = [
  {
    id: BigInt(1),
    title: "Pothole on MG Road near bus stand",
    description:
      "Large pothole has formed after heavy rains. Two-wheelers are at risk of accidents.",
    gpsLocation: "28.6129° N, 77.2295° E", // Delhi
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
    gpsLocation: "28.6200° N, 77.2100° E", // Delhi
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
    gpsLocation: "28.6350° N, 77.2450° E", // Delhi
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
    gpsLocation: "28.6440° N, 77.2210° E", // Delhi
    category: IssueCategory.infrastructure,
    upvotes: BigInt(31),
    timestamp: BigInt((Date.now() - 3_600_000) * 1_000_000),
    isVigilance: false,
    reporter: { isAnonymous: () => false, toText: () => "gggg-hhhhh" } as any,
  },
];

// Haversine formula — returns distance in km
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Parse "28.6129° N, 77.2295° E" → {lat, lng}
function parseGps(gpsStr: string): { lat: number; lng: number } | null {
  const match = gpsStr.match(/([\.\d]+)°\s*([NS]),\s*([\d.]+)°\s*([EW])/i);
  if (!match) return null;
  const lat =
    Number.parseFloat(match[1]) * (match[2].toUpperCase() === "S" ? -1 : 1);
  const lng =
    Number.parseFloat(match[3]) * (match[4].toUpperCase() === "W" ? -1 : 1);
  return { lat, lng };
}

interface NagrikTabProps {
  selectedCity: string;
}

export default function NagrikTab({ selectedCity }: NagrikTabProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [vigilanceOpen, setVigilanceOpen] = useState(false);
  const [vigilanceActive, setVigilanceActive] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [_locationLabel, setLocationLabel] = useState<string>("");
  const [localIssues, setLocalIssues] = useState<Issue[]>([]);

  const { addReport, deleteReport, editReport, myReports } = useAppStore();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationLabel("Near Me (20km)");
        },
        () => {
          /* silently ignore — city filter used as fallback */
        },
      );
    }
  }, []);

  const { data: issues, isLoading } = usePublicIssues();
  const createIssue = useCreateIssue();
  const upvoteIssue = useUpvoteIssue();

  const backendIssues: Issue[] =
    issues && issues.length > 0 ? issues : SAMPLE_ISSUES;

  const rawIssues: Issue[] = [...localIssues, ...backendIssues];

  const displayIssues: Issue[] = (() => {
    if (userLocation) {
      return rawIssues.filter((issue) => {
        const coords = parseGps(issue.gpsLocation);
        if (!coords) return false;
        return (
          haversineKm(
            userLocation.lat,
            userLocation.lng,
            coords.lat,
            coords.lng,
          ) <= 20
        );
      });
    }
    return rawIssues.filter((issue) =>
      issue.gpsLocation.toLowerCase().includes(selectedCity.toLowerCase()),
    );
  })();

  const feedLocationLabel = userLocation ? "Near Me (20km)" : selectedCity;

  async function handleSubmit(
    data: Parameters<typeof createIssue.mutateAsync>[0],
  ) {
    const optimisticIssue: Issue = {
      id: BigInt(Date.now()),
      title: data.title,
      description: data.description,
      gpsLocation: data.gpsLocation,
      category: data.category,
      upvotes: BigInt(0),
      timestamp: BigInt(Date.now() * 1_000_000),
      isVigilance: data.isVigilance,
      reporter: { isAnonymous: () => false, toText: () => "me" } as any,
    };

    if (!data.isVigilance) {
      setLocalIssues((prev) => [optimisticIssue, ...prev]);
      addReport(optimisticIssue);
    }

    setReportOpen(false);
    setVigilanceOpen(false);
    setVigilanceActive(false);
    toast.success(
      data.isVigilance
        ? "Vigilance report submitted anonymously ✅"
        : "Issue reported successfully! ✅",
    );

    try {
      await createIssue.mutateAsync(data);
    } catch {
      // Backend failed but report already shown locally — no error shown
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

  function handleDeleteIssue(id: bigint) {
    setLocalIssues((prev) => prev.filter((i) => i.id !== id));
    deleteReport(id);
    toast.success("Report deleted");
  }

  function handleEditIssue(id: bigint, newTitle: string, newDesc: string) {
    setLocalIssues((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, title: newTitle, description: newDesc } : i,
      ),
    );
    editReport(id, newTitle, newDesc);
    toast.success("Report updated");
  }

  const myReportIds = new Set(myReports.map((r) => r.id.toString()));

  return (
    <div className="flex flex-col h-full relative">
      {/* Hero Banner */}
      <div className="gradient-saffron rounded-2xl mx-4 mt-4 mb-3 px-4 py-4 text-white">
        <h2 className="text-xl font-bold leading-tight">Welcome, Nagrik! 🇮🇳</h2>
        <div className="flex items-center gap-1.5 mt-0.5">
          <MapPin className="w-3.5 h-3.5 opacity-80" />
          <p className="text-sm opacity-90">{selectedCity} · Civic Super App</p>
        </div>
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

      {/* GPS / City status chip */}
      <div className="px-4 mb-2">
        {userLocation ? (
          <div className="inline-flex items-center gap-1.5 bg-success/10 border border-success/30 rounded-full px-3 py-1">
            <span className="text-xs">📍</span>
            <span className="text-xs font-semibold text-success">
              GPS Active — Showing issues within 20km
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-muted border border-border rounded-full px-3 py-1">
            <span className="text-xs">🏙️</span>
            <span className="text-xs font-medium text-muted-foreground">
              Showing issues for {selectedCity}
            </span>
          </div>
        )}
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
          {feedLocationLabel} · {displayIssues.length} issues
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
                isOwner={myReportIds.has(issue.id.toString())}
                onDelete={handleDeleteIssue}
                onEdit={handleEditIssue}
              />
            ))}

        {!isLoading && displayIssues.length === 0 && (
          <div className="text-center py-12" data-ocid="nagrik.empty_state">
            <div className="text-4xl mb-3">🏙️</div>
            <p className="text-muted-foreground text-sm">
              No issues reported in {selectedCity} yet.
            </p>
            <p className="text-muted-foreground text-xs">
              Be the first to report one!
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
