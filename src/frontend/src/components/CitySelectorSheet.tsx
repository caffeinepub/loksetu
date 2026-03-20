import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MapPin, Search } from "lucide-react";
import { useState } from "react";

const INDIAN_CITIES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Kolkata",
  "Jaipur",
  "Lucknow",
  "Surat",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Prayagraj",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Chandigarh",
  "Guwahati",
  "Solapur",
  "Hubli-Dharwad",
  "Bareilly",
  "Moradabad",
  "Mysuru",
  "Gurugram",
  "Aligarh",
  "Jalandhar",
  "Tiruchirappalli",
  "Bhubaneswar",
  "Salem",
  "Mira-Bhayandar",
  "Thiruvananthapuram",
  "Bhiwandi",
  "Saharanpur",
  "Gorakhpur",
  "Guntur",
  "Bikaner",
  "Amravati",
  "Noida",
  "Jamshedpur",
  "Bhilai",
  "Warangal",
  "Cuttack",
  "Firozabad",
  "Kochi",
  "Dehradun",
  "Durgapur",
  "Asansol",
  "Nanded",
  "Kolhapur",
  "Ajmer",
  "Kalaburagi",
  "Jamnagar",
  "Ujjain",
  "Loni",
  "Siliguri",
  "Jhansi",
  "Ulhasnagar",
  "Nellore",
  "Jammu",
  "Sangli",
  "Belagavi",
  "Mangaluru",
  "Ambattur",
  "Tirunelveli",
  "Malegaon",
  "Gaya",
  "Jalgaon",
  "Udaipur",
  "Tiruppur",
  "Davanagere",
  "Kozhikode",
  "Akola",
  "Kurnool",
  "Bokaro Steel City",
  "Rajahmundry",
  "Bhavnagar",
  "Maheshtala",
  "Tiruvottiyur",
  "Pondicherry",
  "Shimla",
  "Panaji",
  "Aizawl",
  "Imphal",
  "Itanagar",
  "Kohima",
  "Dispur",
  "Gangtok",
  "Agartala",
  "Shillong",
];

interface CitySelectorSheetProps {
  open: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export default function CitySelectorSheet({
  open,
  onClose,
  selectedCity,
  onSelectCity,
}: CitySelectorSheetProps) {
  const [search, setSearch] = useState("");

  const filtered = INDIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSelect(city: string) {
    onSelectCity(city);
    setSearch("");
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[75vh] px-0 rounded-t-2xl">
        <SheetHeader className="px-4 pb-3 border-b border-border">
          <SheetTitle className="text-base font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            अपना शहर चुनें
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              data-ocid="city_selector.search_input"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(75vh-130px)] px-4 pb-6">
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              className={`w-full text-left px-3 py-3 rounded-xl text-sm flex items-center justify-between transition-colors ${
                city === selectedCity
                  ? "bg-accent/10 text-accent font-semibold"
                  : "hover:bg-muted text-foreground"
              }`}
              onClick={() => handleSelect(city)}
              data-ocid="city_selector.button"
            >
              <span>{city}</span>
              {city === selectedCity && (
                <MapPin className="w-3.5 h-3.5 text-accent" />
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p
              className="text-muted-foreground text-sm text-center py-8"
              data-ocid="city_selector.empty_state"
            >
              No cities found
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
