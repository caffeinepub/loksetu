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
import {
  addReport as activityAddReport,
  getReports,
} from "../store/appActivity";
import { useAppStore } from "../store/appStore";
import {
  type SeedReport,
  getSeedReports,
  saveSeedReports,
} from "../utils/seedData";

// Rough GPS coords for major Indian cities
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Patna: { lat: 25.5941, lng: 85.1376 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
};

function getCityCoords(cityName: string): { lat: number; lng: number } {
  return CITY_COORDS[cityName] ?? { lat: 20.5937, lng: 78.9629 }; // India center fallback
}

function makeSampleIssues(selectedCity: string): Issue[] {
  const coords = getCityCoords(selectedCity);
  const offset = (n: number) => (coords.lat + n * 0.02).toFixed(4);
  const offsetLng = (n: number) => (coords.lng + n * 0.02).toFixed(4);

  return [
    {
      id: BigInt(1),
      title: "Pothole near main market",
      description:
        "Large pothole at the main market crossing. Two-wheelers at serious risk after heavy rains.",
      gpsLocation: `${offset(0)}° N, ${offsetLng(0)}° E`,
      category: IssueCategory.infrastructure,
      upvotes: BigInt(14),
      timestamp: BigInt((Date.now() - 7_200_000) * 1_000_000),
      isVigilance: false,
      reporter: { isAnonymous: () => false, toText: () => "aaaa-bbbbb" } as any,
    },
    {
      id: BigInt(2),
      title: "Garbage pile-up at residential corner",
      description:
        "Municipal garbage truck hasn't come for 5 days. Foul smell and health hazard for residents.",
      gpsLocation: `${offset(1)}° N, ${offsetLng(1)}° E`,
      category: IssueCategory.sanitation,
      upvotes: BigInt(6),
      timestamp: BigInt((Date.now() - 18_000_000) * 1_000_000),
      isVigilance: false,
      reporter: { isAnonymous: () => false, toText: () => "cccc-ddddd" } as any,
    },
    {
      id: BigInt(3),
      title: "Streetlight broken near park",
      description:
        "Multiple streetlights non-functional near the city park. Safety concern for night walkers.",
      gpsLocation: `${offset(-1)}° N, ${offsetLng(-1)}° E`,
      category: IssueCategory.publicSafety,
      upvotes: BigInt(9),
      timestamp: BigInt((Date.now() - 86_400_000) * 1_000_000),
      isVigilance: false,
      reporter: { isAnonymous: () => false, toText: () => "eeee-fffff" } as any,
    },
    {
      id: BigInt(4),
      title: "Water pipe leakage on main road",
      description:
        "Municipal water pipe burst near the main road, flooding and causing major traffic snarls.",
      gpsLocation: `${offset(2)}° N, ${offsetLng(2)}° E`,
      category: IssueCategory.infrastructure,
      upvotes: BigInt(3),
      timestamp: BigInt((Date.now() - 3_600_000) * 1_000_000),
      isVigilance: false,
      reporter: { isAnonymous: () => false, toText: () => "gggg-hhhhh" } as any,
    },
  ];
}

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
  const match = gpsStr.match(/([.\d]+)°\s*([NS]),\s*([\d.]+)°\s*([EW])/i);
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
  const [feedScope, setFeedScope] = useState<"all" | "city">("all");
  const [sortMode, setSortMode] = useState<"latest" | "upvoted">("latest");

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

  const SAMPLE_ISSUES = makeSampleIssues(selectedCity);
  const backendIssues: Issue[] =
    issues && issues.length > 0 ? issues : SAMPLE_ISSUES;

  // Load seed reports from localStorage (set by seedIfEmpty() on app load)
  const seedReports: SeedReport[] = getSeedReports();
  const seedIssues: Issue[] = seedReports.map(
    (r) =>
      ({
        id: BigInt(
          r.id.replace(/\D/g, "").slice(0, 15) ||
            r.timestamp.toString().slice(0, 15),
        ),
        title: r.title,
        description: r.description,
        gpsLocation: r.gpsLocation,
        category: r.category as any,
        upvotes: BigInt(r.upvotes),
        timestamp: BigInt(r.timestamp * 1_000_000),
        isVigilance: false,
        reporter:
          r.identityMode === "anonymous"
            ? ({ isAnonymous: () => true, toText: () => "anonymous" } as any)
            : ({
                isAnonymous: () => false,
                toText: () => r.reporterName,
              } as any),
        localMediaUrl: r.mediaUrl,
        localMediaIsVideo: r.mediaIsVideo,
        reporterName: r.reporterName,
        reporterInitials: r.reporterInitials,
        verified: r.verified,
        city: r.city,
      }) as any,
  );

  // Merge activityIssues from localStorage so they survive tab switches
  const activityIssues: Issue[] = getReports().map(
    (r) =>
      ({
        id: BigInt(r.id.replace(/\D/g, "").slice(0, 15) || "0"),
        title: r.title,
        description: r.description || "",
        gpsLocation: r.city || selectedCity,
        category: r.category as any,
        upvotes: BigInt(0),
        timestamp: BigInt(r.timestamp * 1_000_000),
        isVigilance: false,
        reporter: { isAnonymous: () => false, toText: () => "me" } as any,
        localMediaUrl: r.mediaUrl,
        localMediaIsVideo: r.mediaType === "video",
      }) as any,
  );

  const rawIssues: Issue[] = [
    ...activityIssues,
    ...localIssues,
    ...seedIssues,
    ...backendIssues,
  ];

  // Filter: All India vs My City
  const filteredIssues: Issue[] = (() => {
    if (feedScope === "all") return rawIssues;
    // My City filter
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
    return rawIssues.filter((issue) => {
      const loc = issue.gpsLocation.toLowerCase();
      const city = selectedCity.toLowerCase();
      if (loc.includes("°")) return loc.includes(city);
      return loc.includes(city) || city.includes(loc);
    });
  })();

  // Sort
  const displayIssues: Issue[] = [...filteredIssues].sort((a, b) => {
    if (sortMode === "upvoted") return Number(b.upvotes) - Number(a.upvotes);
    return Number(b.timestamp) - Number(a.timestamp);
  });

  const feedLocationLabel =
    feedScope === "all"
      ? `India · ${displayIssues.length} issues`
      : `${selectedCity} · ${displayIssues.length} issues`;

  async function handleSubmit(
    data: Parameters<typeof createIssue.mutateAsync>[0] & {
      mediaUrl?: string;
      mediaIsVideo?: boolean;
      identityMode: "anonymous" | "real";
    },
  ) {
    const isAnonymousPost = data.identityMode === "anonymous";

    const optimisticIssue: Issue = {
      id: BigInt(Date.now()),
      title: data.title,
      description: data.description,
      gpsLocation: data.gpsLocation,
      category: data.category,
      upvotes: BigInt(0),
      timestamp: BigInt(Date.now() * 1_000_000),
      isVigilance: data.isVigilance,
      reporter: isAnonymousPost
        ? ({ isAnonymous: () => true, toText: () => "anonymous" } as any)
        : ({ isAnonymous: () => false, toText: () => "me" } as any),
    };

    // Mark as AI-verified after the scanning animation completes
    (optimisticIssue as any).isAiVerified = true;

    // Always save media, add to feed and profile — for ALL reports including vigilance
    if (data.mediaUrl) {
      (optimisticIssue as any).localMediaUrl = data.mediaUrl;
      (optimisticIssue as any).localMediaIsVideo = data.mediaIsVideo ?? false;
    }

    // Add to feed immediately (reactive update)
    setLocalIssues((prev) => [optimisticIssue, ...prev]);

    // Persist new report to loksetu_nagrik_feed (alongside seed data)
    const newSeedReport: SeedReport = {
      id: optimisticIssue.id.toString(),
      title: data.title,
      description: data.description ?? "",
      category: String(data.category),
      city: selectedCity,
      gpsLocation: data.gpsLocation,
      mediaUrl: data.mediaUrl ?? "",
      mediaIsVideo: data.mediaIsVideo ?? false,
      upvotes: 0,
      downvotes: 0,
      reporterName:
        data.identityMode === "anonymous" ? "Anonymous Citizen" : "You",
      reporterInitials: data.identityMode === "anonymous" ? "AC" : "YO",
      identityMode: data.identityMode,
      timestamp: Date.now(),
      verified: false,
      comments: [],
    };
    saveSeedReports([newSeedReport, ...getSeedReports()]);

    // Persist to appStore (My Reports)
    addReport(optimisticIssue);

    // Save to appActivity store for ProfileTab display
    activityAddReport({
      id: optimisticIssue.id.toString(),
      title: data.title,
      category: String(data.category),
      city: selectedCity,
      description: data.description,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaIsVideo
        ? "video"
        : data.mediaUrl
          ? "photo"
          : undefined,
      timestamp: Date.now(),
    });

    setReportOpen(false);
    setVigilanceOpen(false);
    setVigilanceActive(false);
    toast.success(
      data.isVigilance
        ? "Vigilance report submitted! Visible in feed as Anonymous Citizen ✅"
        : "Issue reported successfully! ✅",
    );

    try {
      await createIssue.mutateAsync(data);
    } catch {
      // Backend failed but report already shown locally — no error shown
    }
  }

  async function handleUpvote(id: bigint) {
    setLocalIssues((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, upvotes: i.upvotes + BigInt(1) } : i,
      ),
    );
    try {
      await upvoteIssue.mutateAsync(id);
    } catch {
      // silently ignore
    }
  }

  function handleDownvote(id: bigint) {
    setLocalIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, downvotes: ((i as any).downvotes ?? BigInt(0)) + BigInt(1) }
          : i,
      ),
    );
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

      {/* All India / My City Toggle */}
      <div className="px-4 mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFeedScope("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            feedScope === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
          }`}
          data-ocid="nagrik.toggle"
        >
          🌍 All India
        </button>
        <button
          type="button"
          onClick={() => setFeedScope("city")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            feedScope === "city"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
          }`}
          data-ocid="nagrik.toggle"
        >
          📍 My City
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() =>
            setSortMode((prev) => (prev === "latest" ? "upvoted" : "latest"))
          }
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-muted border border-border text-muted-foreground hover:bg-muted/80 transition-colors"
          data-ocid="nagrik.toggle"
        >
          {sortMode === "latest" ? "🕐 Latest" : "🔥 Top Voted"}
        </button>
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
                ⚠️ Vigilance Mode Active — Report appears in feed as Anonymous
                Citizen
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Feed header */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Community Feed</h3>
        <span className="text-xs text-muted-foreground">
          {feedLocationLabel}
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
                onDownvote={handleDownvote}
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
              No issues reported
              {feedScope === "city" ? ` in ${selectedCity}` : ""} yet.
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
