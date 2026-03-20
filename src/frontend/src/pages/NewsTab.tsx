import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Bus,
  ChevronRight,
  Droplets,
  Leaf,
  Phone,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import { toast } from "sonner";
import { useMarketRates, useNews } from "../hooks/useQueries";

const SAMPLE_HEADLINES = [
  "Delhi Air Quality improves to 'Good' category after weekend rains 🌧️",
  "New metro line extension approved: Janakpuri to RK Puram corridor",
  "Municipal Corporation conducts free health camps in 50 wards this week",
  "Vegetable prices stabilize after APMC intervention — Onion at ₹28/kg",
  "Power department announces 2-hour maintenance cuts for North Delhi zones",
  "Shramdaan drive this Sunday: 10,000 volunteers to clean Yamuna banks",
];

const CITY_HUB_TILES = [
  {
    id: "transit",
    icon: Bus,
    label: "Transit\nTimetables",
    color: "text-blue-600",
    bg: "bg-blue-50",
    emoji: "🚌",
  },
  {
    id: "power",
    icon: Zap,
    label: "Power Outage\nSchedule",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    emoji: "⚡",
  },
  {
    id: "emergency",
    icon: Phone,
    label: "Emergency\nDirectory",
    color: "text-red-600",
    bg: "bg-red-50",
    emoji: "🚑",
  },
  {
    id: "blood",
    icon: Droplets,
    label: "Blood Bank\nAvailability",
    color: "text-rose-600",
    bg: "bg-rose-50",
    emoji: "🩸",
  },
  {
    id: "jobs",
    icon: Briefcase,
    label: "Job / Skill\nExchange",
    color: "text-purple-600",
    bg: "bg-purple-50",
    emoji: "💼",
  },
  {
    id: "shramdaan",
    icon: Leaf,
    label: "Shramdaan\nVolunteering",
    color: "text-green-600",
    bg: "bg-green-50",
    emoji: "🌱",
  },
];

export default function NewsTab() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: marketRates, isLoading: ratesLoading } = useMarketRates();
  const { data: news } = useNews();

  const headlines =
    news && news.length > 0 ? news.map((n) => n.headline) : SAMPLE_HEADLINES;

  const rates = marketRates ?? {
    petrol: "94.72",
    diesel: "87.62",
    cng: "76.59",
    lpg: "903.00",
    onion: "28.50",
    tomato: "32.00",
    potato: "22.00",
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {/* News Ticker */}
      <div className="pt-4 px-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">
            LIVE
          </span>
          <h3 className="text-sm font-bold text-foreground">
            Today's Headlines
          </h3>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        >
          {headlines.map((headline, i) => (
            <motion.div
              key={headline.slice(0, 30)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex-shrink-0 w-64 bg-card rounded-xl p-3 shadow-card border border-border"
              data-ocid={`news.item.${i + 1}`}
            >
              <p className="text-xs text-card-foreground leading-snug line-clamp-3">
                {headline}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Market Dashboard */}
      <div className="px-4 mb-4">
        <h3 className="text-base font-bold text-foreground mb-2">
          📊 Today's Market Rates
        </h3>
        <div className="gradient-green rounded-2xl p-4 text-white">
          <p className="text-xs font-medium opacity-80 mb-3">
            As of today — Delhi NCR
          </p>

          {/* Fuel Rates */}
          <div className="mb-3">
            <p className="text-xs font-bold opacity-70 uppercase tracking-wider mb-2">
              ⛽ Fuel
            </p>
            {ratesLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 bg-white/20 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2" data-ocid="news.section">
                {[
                  { label: "Petrol", value: rates.petrol, unit: "/L" },
                  { label: "Diesel", value: rates.diesel, unit: "/L" },
                  { label: "CNG", value: rates.cng, unit: "/kg" },
                  { label: "LPG", value: rates.lpg, unit: "/14kg" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/15 rounded-xl px-3 py-2.5 backdrop-blur-sm"
                  >
                    <p className="text-xs opacity-80">{item.label}</p>
                    <p className="text-lg font-bold">₹{item.value}</p>
                    <p className="text-xs opacity-60">{item.unit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mandi Rates */}
          <div>
            <p className="text-xs font-bold opacity-70 uppercase tracking-wider mb-2">
              🥦 APMC Mandi
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Onion", value: rates.onion },
                { label: "Tomato", value: rates.tomato },
                { label: "Potato", value: rates.potato },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/15 rounded-xl px-2 py-2.5 text-center backdrop-blur-sm"
                >
                  <p className="text-xs opacity-80">{item.label}</p>
                  <p className="text-base font-bold">₹{item.value}</p>
                  <p className="text-xs opacity-60">/kg</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* City Hub */}
      <div className="px-4">
        <h3 className="text-base font-bold text-foreground mb-2">🏙️ City Hub</h3>
        <div className="grid grid-cols-2 gap-3">
          {CITY_HUB_TILES.map((tile, i) => (
            <motion.button
              key={tile.id}
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border flex flex-col items-center gap-2 text-center"
              onClick={() =>
                toast.info(
                  `${tile.emoji} ${tile.label.replace("\n", " ")} — coming soon!`,
                )
              }
              data-ocid={`news.item.${i + 1}`}
            >
              <span className="text-2xl">{tile.emoji}</span>
              <span className="text-xs font-semibold text-card-foreground leading-tight whitespace-pre-line">
                {tile.label}
              </span>
              <ChevronRight className={`w-3.5 h-3.5 ${tile.color}`} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
