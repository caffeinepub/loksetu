import { Skeleton } from "@/components/ui/skeleton";
import { Bus, ChevronRight, Leaf, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import {
  EmergencySheet,
  ShramdaanSheet,
  TransitSheet,
} from "../components/CityHubSheets";
import { useMarketRates, useNews } from "../hooks/useQueries";

// City → State mapping
const CITY_STATE_MAP: Record<string, string> = {
  Delhi: "Delhi",
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Nagpur: "Maharashtra",
  Nashik: "Maharashtra",
  Bengaluru: "Karnataka",
  Mysuru: "Karnataka",
  Hubballi: "Karnataka",
  Chennai: "Tamil Nadu",
  Coimbatore: "Tamil Nadu",
  Madurai: "Tamil Nadu",
  Hyderabad: "Telangana",
  Warangal: "Telangana",
  Kolkata: "West Bengal",
  Howrah: "West Bengal",
  Ahmedabad: "Gujarat",
  Surat: "Gujarat",
  Vadodara: "Gujarat",
  Rajkot: "Gujarat",
  Gandhinagar: "Gujarat",
  Jaipur: "Rajasthan",
  Jodhpur: "Rajasthan",
  Udaipur: "Rajasthan",
  Kota: "Rajasthan",
  Lucknow: "Uttar Pradesh",
  Kanpur: "Uttar Pradesh",
  Agra: "Uttar Pradesh",
  Varanasi: "Uttar Pradesh",
  Prayagraj: "Uttar Pradesh",
  Ghaziabad: "Uttar Pradesh",
  Noida: "Uttar Pradesh",
  Meerut: "Uttar Pradesh",
  Patna: "Bihar",
  Gaya: "Bihar",
  Bhopal: "Madhya Pradesh",
  Indore: "Madhya Pradesh",
  Gwalior: "Madhya Pradesh",
  Jabalpur: "Madhya Pradesh",
  Chandigarh: "Punjab/Haryana",
  Amritsar: "Punjab",
  Ludhiana: "Punjab",
  Jalandhar: "Punjab",
  Faridabad: "Haryana",
  Gurugram: "Haryana",
  Kochi: "Kerala",
  Thiruvananthapuram: "Kerala",
  Kozhikode: "Kerala",
  Thrissur: "Kerala",
  Bhubaneswar: "Odisha",
  Cuttack: "Odisha",
  Guwahati: "Assam",
  Dispur: "Assam",
  Dehradun: "Uttarakhand",
  Haridwar: "Uttarakhand",
  Ranchi: "Jharkhand",
  Jamshedpur: "Jharkhand",
  Raipur: "Chhattisgarh",
  Bhilai: "Chhattisgarh",
  Shimla: "Himachal Pradesh",
  Dharamsala: "Himachal Pradesh",
  Srinagar: "Jammu & Kashmir",
  Jammu: "Jammu & Kashmir",
  Panaji: "Goa",
  Aizawl: "Mizoram",
  Imphal: "Manipur",
  Shillong: "Meghalaya",
  Kohima: "Nagaland",
  Itanagar: "Arunachal Pradesh",
  Gangtok: "Sikkim",
  Agartala: "Tripura",
};

// City-specific headlines
const CITY_HEADLINES: Record<string, string[]> = {
  Delhi: [
    "Delhi Air Quality improves to 'Good' category after weekend rains 🌧️",
    "New metro line extension approved: Janakpuri to RK Puram corridor",
    "NDMC launches free health camps in 50 wards this month",
    "Yamuna Expressway widening project enters final phase",
  ],
  Mumbai: [
    "Mumbai local train services resume after weekend maintenance on Harbour Line",
    "BMC begins major road repair drive in Dharavi and Sion areas",
    "Coastal Road Project southern stretch opens to public ahead of schedule",
    "Mumbai rains: IMD issues orange alert for Thane and Raigad districts",
  ],
  Pune: [
    "Pune Metro Phase 2 construction on schedule — Hinjewadi corridor by Q4",
    "PMC launches clean drinking water initiative for Hadapsar residents",
    "Kothrud flyover expansion approved — work begins next month",
    "Pune IT park shuttle service expanded to 15 new routes",
  ],
  Bengaluru: [
    "BBMP announces pothole repair drive covering 50 wards this week",
    "Namma Metro Purple Line extension inauguration scheduled this month",
    "Bengaluru gets 5 new parks under Green City initiative",
    "Outer Ring Road signal-free corridor approved by BBMP council",
  ],
  Hyderabad: [
    "GHMC road widening project on Tank Bund Road enters execution phase",
    "Hyderabad air pollution at lowest in 5 years, TSPCB reports",
    "Metro Rail Phase 2 to connect HICC and Financial District by 2026",
    "HMWSSB rolls out 24x7 water supply in 3 more GHMC circles",
  ],
  Chennai: [
    "Chennai Metro Rail Phase 2 civil work 68% complete as of this week",
    "Greater Chennai Corporation undertakes pre-monsoon drain cleaning drive",
    "Potholes on ECR and OMR to be repaired under ₹120 Cr CMDA project",
    "Chennai Beach restoration project: 2 km of shoreline to be cleaned",
  ],
  Kolkata: [
    "Kolkata Metro East-West Corridor: Howrah Maidan station opens this Friday",
    "KMC floods preparedness: 200 pumping stations activated ahead of monsoon",
    "New flyover on VIP Road to reduce Ultadanga congestion by 40%",
    "Kolkata's Rabindra Sarobar lake cleanup drive underway this week",
  ],
  Ahmedabad: [
    "AMTS introduces 50 new electric buses on City Loop routes",
    "AMC begins Smart City road beautification on CG Road and SG Highway",
    "Ahmedabad Metro Phase 2 Motera extension approved by Union Cabinet",
  ],
  Jaipur: [
    "Jaipur Metro corridor 2B alignment finalized — work begins Q2",
    "JDA launches tree plantation drive targeting 1 lakh saplings",
    "Jaipur Heritage Circuit roads get a makeover ahead of tourism season",
  ],
  Lucknow: [
    "Lucknow Metro Munshipulia to Vasant Kunj extension opens next month",
    "Nagar Nigam clears 200 MT of pending garbage from Gomti Nagar zone",
    "Smart City mission: 80 smart signals installed on ring road",
  ],
};

// State-level fallback headlines
const STATE_HEADLINES: Record<string, string[]> = {
  Maharashtra: [
    "Maharashtra government announces ₹500 Cr road repair fund for state highways",
    "MSRTC expands inter-city bus service with 300 new buses",
  ],
  Karnataka: [
    "Karnataka budget allocates ₹2000 Cr for rural road connectivity",
    "KSRTC launches new Volvo express service on 10 key corridors",
  ],
  "Tamil Nadu": [
    "Tamil Nadu government unveils new water grid project for 5 districts",
    "TNSTC adds AC buses on major pilgrim routes ahead of festive season",
  ],
  Telangana: [
    "Telangana Mission Bhagiratha reaches 90% household water coverage",
    "TS Road Development Corporation approves bypass for 8 towns",
  ],
  "West Bengal": [
    "West Bengal adds 200 km of rural road under Pradhan Mantri Gram Sadak",
    "WBTC introduces app-based bus tracking for Kolkata city routes",
  ],
  Gujarat: [
    "Gujarat Expressway network to expand with 4 new greenfield roads",
    "GSRTC launches EV bus pilot on Ahmedabad–Gandhinagar route",
  ],
  Rajasthan: [
    "Rajasthan Rural Roads scheme covers 1200 villages this fiscal year",
    "RSRTC expands night service buses for desert circuit tourism",
  ],
  "Uttar Pradesh": [
    "UP Expressway Authority completes Ganga Expressway ahead of schedule",
    "UPSRTC doubles Lucknow–Agra AC bus frequency from next week",
  ],
  Bihar: [
    "Bihar Road Construction Department repairs 4000 km of state highways",
    "BSRTC launches new Patna–Gaya AC bus service",
  ],
  "Madhya Pradesh": [
    "MP government announces new fly-over projects for Bhopal and Indore",
    "MPSRTC adds 100 new buses for connecting tribal district headquarters",
  ],
  Kerala: [
    "Kerala builds India's first fully solar-powered bus terminus in Kochi",
    "KSRTC launches real-time tracking app for all routes statewide",
  ],
  Punjab: [
    "Punjab government approves 4-lane highway connecting Amritsar and Ludhiana",
    "PUNBUS introduces WhatsApp-based ticket booking system",
  ],
  Haryana: [
    "Haryana Roadways launches new AC service from Gurugram to Delhi",
    "HRERA cracks down on builders delaying possession in NCR region",
  ],
};

const DEFAULT_HEADLINES = [
  "New metro line extensions approved across major Indian cities",
  "Municipal corporations launch free health camps this month",
  "Smart City mission: 500+ new smart signals installed nationally",
  "Pre-monsoon drain cleaning drives underway in all metro cities",
  "National road repair fund of ₹2000 Cr announced for state highways",
];

type TileId = "transit" | "emergency" | "shramdaan";

const CITY_HUB_TILES: {
  id: TileId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bg: string;
  emoji: string;
}[] = [
  {
    id: "transit",
    icon: Bus,
    label: "Transit\nTimetables",
    color: "text-blue-600",
    bg: "bg-blue-50",
    emoji: "🚌",
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
    id: "shramdaan",
    icon: Leaf,
    label: "Shramdaan\nVolunteering",
    color: "text-green-600",
    bg: "bg-green-50",
    emoji: "🌱",
  },
];

interface NewsTabProps {
  selectedCity: string;
}

export default function NewsTab({ selectedCity }: NewsTabProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: marketRates, isLoading: ratesLoading } = useMarketRates();
  const { data: news } = useNews();
  const [activeSheet, setActiveSheet] = useState<TileId | null>(null);

  // Compute headlines: city-specific, then state fallback, then default
  const cityHeadlines = CITY_HEADLINES[selectedCity] ?? [];
  const stateName = CITY_STATE_MAP[selectedCity];
  const stateHeadlines = stateName ? (STATE_HEADLINES[stateName] ?? []) : [];

  const backendHeadlines =
    news && news.length > 0 ? news.map((n) => n.headline) : [];

  let headlines: string[];
  if (backendHeadlines.length >= 3) {
    headlines = backendHeadlines;
  } else if (cityHeadlines.length >= 3) {
    headlines = cityHeadlines;
  } else {
    const combined = [...cityHeadlines, ...stateHeadlines];
    headlines = combined.length > 0 ? combined : DEFAULT_HEADLINES;
  }

  const rates = marketRates ?? {
    petrol: "94.72",
    diesel: "87.62",
    cng: "76.59",
    lpg: "903.00",
    onion: "28.50",
    tomato: "32.00",
    potato: "22.00",
  };

  const closeSheet = () => setActiveSheet(null);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {/* News Ticker */}
      <div className="pt-4 px-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">
            LIVE
          </span>
          <h3 className="text-sm font-bold text-foreground">
            Today's Headlines · {selectedCity}
          </h3>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
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

      {/* Market Dashboard — Fuel only */}
      <div className="px-4 mb-4">
        <h3 className="text-base font-bold text-foreground mb-2">
          📊 Today's Market Rates
        </h3>
        <div className="gradient-green rounded-2xl p-4 text-white">
          <p className="text-xs font-medium opacity-80 mb-1">
            As of today — {selectedCity}
          </p>
          <p className="text-xs opacity-60 mb-3">
            📍 Rates for {selectedCity} region
          </p>
          <div>
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
        </div>
      </div>

      {/* City Hub */}
      <div className="px-4">
        <h3 className="text-base font-bold text-foreground mb-2">
          🏙️ City Hub · {selectedCity}
        </h3>
        <div className="grid grid-cols-3 gap-3">
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
              onClick={() => setActiveSheet(tile.id)}
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

      {/* City Hub Sheets */}
      <TransitSheet
        open={activeSheet === "transit"}
        onClose={closeSheet}
        selectedCity={selectedCity}
      />
      <EmergencySheet
        open={activeSheet === "emergency"}
        onClose={closeSheet}
        selectedCity={selectedCity}
      />
      <ShramdaanSheet open={activeSheet === "shramdaan"} onClose={closeSheet} />
    </div>
  );
}
