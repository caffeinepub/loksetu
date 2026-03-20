import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  Briefcase,
  Bus,
  Clock,
  Droplets,
  Leaf,
  MapPin,
  Phone,
  Zap,
} from "lucide-react";

// ─── TRANSIT ─────────────────────────────────────────────────────────────────
const CITY_TRANSIT: Record<string, { metro: string; bus: string }> = {
  Delhi: {
    metro:
      "Delhi Metro — Blue, Yellow, Red, Green, Violet Lines operational. Next train: 3 min",
    bus: "DTC Bus 423 → Connaught Place: 8 min | Bus 764 → ISBT: 12 min",
  },
  Mumbai: {
    metro:
      "Mumbai Metro Line 1 (Versova–Ghatkopar) operational. Next train: 5 min",
    bus: "BEST Bus 315 → CST: 10 min | Bus 22 → Bandra: 7 min",
  },
  Bengaluru: {
    metro: "Namma Metro Purple & Green Lines operational. Next train: 4 min",
    bus: "BMTC Bus 500C → MG Road: 6 min | Bus 335E → Whitefield: 18 min",
  },
  Chennai: {
    metro: "Chennai Metro Blue & Green Lines operational. Next train: 6 min",
    bus: "MTC Bus 27B → Central: 9 min | Bus 70C → T. Nagar: 14 min",
  },
  Hyderabad: {
    metro:
      "Hyderabad Metro Red, Blue, Green Lines operational. Next train: 5 min",
    bus: "TSRTC Bus 218 → Secunderabad: 11 min | Bus 65M → MGBS: 8 min",
  },
  Pune: {
    metro:
      "Pune Metro Phase 1 operational (Pimpri–Swargate). Next train: 7 min",
    bus: "PMPML Bus 164 → Shivajinagar: 5 min | Bus 321 → Kothrud: 13 min",
  },
};

export function TransitSheet({
  open,
  onClose,
  selectedCity,
}: { open: boolean; onClose: () => void; selectedCity: string }) {
  const cityData = CITY_TRANSIT[selectedCity];
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600" /> Transit Info ·{" "}
            {selectedCity}
          </SheetTitle>
        </SheetHeader>

        {cityData ? (
          <>
            <div className="mb-5">
              <h4 className="font-bold text-sm mb-2 text-blue-700">🚇 Metro</h4>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-sm text-blue-800">{cityData.metro}</p>
              </div>
            </div>
            <div className="mb-5">
              <h4 className="font-bold text-sm mb-2 text-orange-700">
                🚌 Bus Timings
              </h4>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-sm text-orange-800">{cityData.bus}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-sm mb-1 text-gray-600">🚇 Metro</h4>
              <p className="text-sm text-gray-500">
                Metro: Not Available for {selectedCity}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-sm mb-1 text-gray-600">
                🚌 Bus Timings
              </h4>
              <p className="text-sm text-gray-500">
                Bus timings: Not Available for {selectedCity} — Check local
                transport authority website
              </p>
            </div>
          </div>
        )}
        <p className="text-xs text-center text-gray-400 mt-4">
          Times are indicative. Check your city's transport app for real-time
          updates.
        </p>
      </SheetContent>
    </Sheet>
  );
}

// ─── POWER OUTAGE ─────────────────────────────────────────────────────────────
const OUTAGE_SCHEDULE = [
  {
    zone: "North Delhi – Civil Lines",
    date: "Today",
    time: "10:00 AM – 12:00 PM",
    reason: "Feeder maintenance",
  },
  {
    zone: "East Delhi – Preet Vihar",
    date: "Today",
    time: "2:00 PM – 4:00 PM",
    reason: "Transformer upgrade",
  },
  {
    zone: "South Delhi – Saket",
    date: "Tomorrow",
    time: "06:00 AM – 08:00 AM",
    reason: "Cable replacement",
  },
  {
    zone: "West Delhi – Uttam Nagar",
    date: "Tomorrow",
    time: "11:00 AM – 1:00 PM",
    reason: "Line testing",
  },
  {
    zone: "Noida Sec-62",
    date: "22 Mar",
    time: "08:00 AM – 11:00 AM",
    reason: "Sub-station work",
  },
];

export function PowerOutageSheet({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" /> Power Outage Schedule
          </SheetTitle>
        </SheetHeader>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-800">
            Planned maintenance cuts listed below. Emergency outages not listed
            — call 19123 for BSES / 19124 for TPDDL.
          </p>
        </div>
        <div className="space-y-3">
          {OUTAGE_SCHEDULE.map((o) => (
            <div
              key={o.zone}
              className="bg-white rounded-xl p-3 border border-yellow-100 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <p className="font-semibold text-sm text-gray-800">{o.zone}</p>
                <Badge
                  variant="outline"
                  className="text-xs text-yellow-700 border-yellow-300"
                >
                  {o.date}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">⏱ {o.time}</p>
              <p className="text-xs text-gray-400">{o.reason}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400 mt-4">
          Source: BSES / TPDDL official schedules
        </p>
      </SheetContent>
    </Sheet>
  );
}

// ─── EMERGENCY DIRECTORY ─────────────────────────────────────────────────────
const EMERGENCY_CONTACTS = [
  {
    category: "Universal",
    entries: [
      { name: "Police", number: "100", icon: "🚔" },
      { name: "Ambulance", number: "108", icon: "🚑" },
      { name: "Fire Brigade", number: "101", icon: "🚒" },
      { name: "Emergency (All)", number: "112", icon: "🆘" },
      { name: "Disaster Management", number: "1078", icon: "⚠️" },
    ],
  },
  {
    category: "Women & Child Safety",
    entries: [
      { name: "Women Helpline", number: "1091", icon: "👩" },
      { name: "Child Helpline", number: "1098", icon: "🧒" },
      { name: "Domestic Violence", number: "181", icon: "🛡️" },
    ],
  },
  {
    category: "Health",
    entries: [
      { name: "AIIMS Emergency", number: "011-26589142", icon: "🏥" },
      { name: "Poison Control", number: "1800-116-117", icon: "☠️" },
      { name: "Blood Helpline", number: "1910", icon: "🩸" },
      { name: "COVID Helpline", number: "011-23978046", icon: "😷" },
    ],
  },
  {
    category: "Utilities",
    entries: [
      { name: "Power (BSES)", number: "19123", icon: "⚡" },
      { name: "Power (TPDDL)", number: "19124", icon: "⚡" },
      { name: "Water (DJB)", number: "1916", icon: "💧" },
      { name: "Gas Leak", number: "1906", icon: "🔥" },
    ],
  },
];

export function EmergencySheet({
  open,
  onClose,
  selectedCity,
}: { open: boolean; onClose: () => void; selectedCity?: string }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" /> Emergency Directory
          </SheetTitle>
          <p className="text-xs text-gray-500 mt-1">
            Emergency contacts for {selectedCity || "your city"}
          </p>
        </SheetHeader>
        <div className="space-y-5">
          {EMERGENCY_CONTACTS.map((section) => (
            <div key={section.category}>
              <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">
                {section.category}
              </h4>
              <div className="space-y-2">
                {section.entries.map((e) => (
                  <a
                    key={e.name}
                    href={`tel:${e.number}`}
                    className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 border border-red-100 active:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{e.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          {e.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-700 text-base">
                        {e.number}
                      </span>
                      <Phone className="w-4 h-4 text-red-500" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── BLOOD BANK ───────────────────────────────────────────────────────────────
const BLOOD_BANKS = [
  {
    name: "AIIMS Blood Bank",
    area: "South Delhi",
    phone: "011-26588700",
    available: ["A+", "B+", "O+", "AB+"],
    low: ["A-", "O-"],
  },
  {
    name: "Safdarjung Hospital",
    area: "West Delhi",
    phone: "011-26707444",
    available: ["A+", "B+", "B-", "O+"],
    low: ["AB-"],
  },
  {
    name: "GTB Hospital",
    area: "East Delhi",
    phone: "011-22594042",
    available: ["O+", "B+", "AB+"],
    low: ["A-", "B-"],
  },
  {
    name: "RML Hospital",
    area: "Central Delhi",
    phone: "011-23365525",
    available: ["A+", "B+", "O+", "O-"],
    low: [],
  },
  {
    name: "Sir Ganga Ram Hospital",
    area: "West Delhi",
    phone: "011-25750000",
    available: ["A+", "AB+", "B+"],
    low: ["AB-", "A-"],
  },
];

export function BloodBankSheet({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-rose-600" /> Blood Bank
            Availability
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-3">
          {BLOOD_BANKS.map((b) => (
            <div
              key={b.name}
              className="bg-white rounded-xl p-3 border border-rose-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-sm text-gray-800">{b.name}</p>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {b.area}
                </span>
              </div>
              <a
                href={`tel:${b.phone}`}
                className="text-xs text-rose-600 font-medium flex items-center gap-1 mb-2"
              >
                <Phone className="w-3 h-3" /> {b.phone}
              </a>
              {b.available.length > 0 && (
                <div className="mb-1">
                  <span className="text-xs text-green-600 font-semibold">
                    ✅ Available:{" "}
                  </span>
                  <span className="flex flex-wrap gap-1 mt-1">
                    {b.available.map((g) => (
                      <Badge
                        key={g}
                        className="bg-green-100 text-green-800 text-xs px-1.5"
                      >
                        {g}
                      </Badge>
                    ))}
                  </span>
                </div>
              )}
              {b.low.length > 0 && (
                <div>
                  <span className="text-xs text-yellow-600 font-semibold">
                    ⚠️ Low Stock:{" "}
                  </span>
                  <span className="flex flex-wrap gap-1 mt-1">
                    {b.low.map((g) => (
                      <Badge
                        key={g}
                        className="bg-yellow-100 text-yellow-800 text-xs px-1.5"
                      >
                        {g}
                      </Badge>
                    ))}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400 mt-4">
          Call ahead to confirm availability before visiting.
        </p>
      </SheetContent>
    </Sheet>
  );
}

// ─── JOBS / SKILL EXCHANGE ───────────────────────────────────────────────────
const JOB_LISTINGS = [
  {
    title: "Data Entry Operator",
    org: "Delhi Municipal Corp.",
    type: "Govt",
    pay: "₹18,000/mo",
    deadline: "31 Mar",
    skills: ["Computer", "Hindi Typing"],
  },
  {
    title: "Safai Karamchari",
    org: "NDMC",
    type: "Govt",
    pay: "₹15,000/mo",
    deadline: "28 Mar",
    skills: ["Physical fitness"],
  },
  {
    title: "Security Guard",
    org: "G4S Services",
    type: "Private",
    pay: "₹16,000/mo",
    deadline: "Open",
    skills: ["10th pass", "Fit"],
  },
  {
    title: "Delivery Executive",
    org: "Swiggy",
    type: "Gig",
    pay: "₹800–1200/day",
    deadline: "Open",
    skills: ["Bike", "Smartphone"],
  },
  {
    title: "Skilled Mason",
    org: "PWD Delhi",
    type: "Govt",
    pay: "₹700/day",
    deadline: "25 Mar",
    skills: ["Experience 2yr+"],
  },
  {
    title: "Stitching Work (WFH)",
    org: "Usha NGO",
    type: "NGO",
    pay: "₹8,000/mo",
    deadline: "Open",
    skills: ["Sewing"],
  },
];

const TYPE_COLOR: Record<string, string> = {
  Govt: "bg-green-100 text-green-800",
  Private: "bg-blue-100 text-blue-800",
  Gig: "bg-orange-100 text-orange-800",
  NGO: "bg-purple-100 text-purple-800",
};

export function JobsSheet({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" /> Job / Skill
            Exchange
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-3">
          {JOB_LISTINGS.map((j) => (
            <div
              key={j.title}
              className="bg-white rounded-xl p-3 border border-purple-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-sm text-gray-800">{j.title}</p>
                <Badge className={`text-xs ${TYPE_COLOR[j.type]}`}>
                  {j.type}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mb-1">{j.org}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-purple-700">
                  {j.pay}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {j.deadline}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {j.skills.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400 mt-4">
          Listings are illustrative. Visit NCS portal for verified postings.
        </p>
      </SheetContent>
    </Sheet>
  );
}

// ─── SHRAMDAAN ────────────────────────────────────────────────────────────────
const VOLUNTEER_DRIVES = [
  {
    title: "Yamuna Cleaning Drive",
    date: "Sun, 23 Mar",
    time: "07:00 – 10:00 AM",
    location: "ITO Ghat, Delhi",
    org: "WWF India",
    spots: 120,
    joined: 87,
  },
  {
    title: "Tree Plantation — 1000 Saplings",
    date: "Sat, 22 Mar",
    time: "06:30 – 09:00 AM",
    location: "Asola Bhatti Wildlife Sanctuary",
    org: "Delhi Forest Dept.",
    spots: 200,
    joined: 143,
  },
  {
    title: "Street Light Survey",
    date: "Fri, 21 Mar",
    time: "06:00 – 08:00 PM",
    location: "Rohini Sec-7",
    org: "RWA Rohini",
    spots: 30,
    joined: 18,
  },
  {
    title: "Senior Citizen Meal Distribution",
    date: "Daily",
    time: "12:00 – 1:00 PM",
    location: "Lodi Colony Old Age Home",
    org: "HelpAge India",
    spots: 10,
    joined: 6,
  },
  {
    title: "Sarkari School Wall Painting",
    date: "Sun, 30 Mar",
    time: "08:00 AM – 1:00 PM",
    location: "Govt School, Mustafabad",
    org: "Teach For India",
    spots: 50,
    joined: 31,
  },
];

export function ShramdaanSheet({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" /> Shramdaan Volunteering
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-3">
          {VOLUNTEER_DRIVES.map((v) => {
            const pct = Math.round((v.joined / v.spots) * 100);
            return (
              <div
                key={v.title}
                className="bg-green-50 rounded-xl p-3 border border-green-100"
              >
                <p className="font-bold text-sm text-gray-800 mb-0.5">
                  {v.title}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {v.location}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {v.date} · {v.time}
                </p>
                <p className="text-xs text-green-700 font-medium mt-1">
                  {v.org}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{v.joined} joined</span>
                    <span>
                      {v.spots} spots · {pct}% full
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-center text-gray-400 mt-4">
          Contact the organiser directly to register.
        </p>
      </SheetContent>
    </Sheet>
  );
}
