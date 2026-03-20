import { Toaster } from "@/components/ui/sonner";
import { Bell, MapPin, Newspaper, Search, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import NagrikTab from "./pages/NagrikTab";
import NewsTab from "./pages/NewsTab";
import ProfileTab from "./pages/ProfileTab";

type Tab = "nagrik" | "news" | "profile";

const TABS: {
  id: Tab;
  label: string;
  hindiLabel: string;
  icon: typeof MapPin;
}[] = [
  { id: "nagrik", label: "Nagrik", hindiLabel: "नागरिक", icon: MapPin },
  { id: "news", label: "News", hindiLabel: "समाचार", icon: Newspaper },
  { id: "profile", label: "Profile", hindiLabel: "प्रोफाइल", icon: User },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("nagrik");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-mobile flex flex-col min-h-screen relative">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-card shadow-sm border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg gradient-saffron flex items-center justify-center">
                    <span className="text-white font-black text-sm">L</span>
                  </div>
                  <div>
                    <p className="font-black text-sm text-primary leading-none">
                      Loksetu
                    </p>
                    <p className="text-xs text-muted-foreground leading-none">
                      Nagrik Civic Utility
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex-1 mx-2">
                <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                  <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search issues, services…"
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                    data-ocid="app.search_input"
                  />
                </div>
              </div>

              {/* Icons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center relative"
                  data-ocid="app.button"
                >
                  <Bell className="w-4 h-4 text-foreground" />
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent rounded-full" />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full gradient-saffron flex items-center justify-center text-white text-sm font-bold"
                  data-ocid="app.secondary_button"
                >
                  R
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
              style={{ paddingBottom: "80px" }}
            >
              {activeTab === "nagrik" && <NagrikTab />}
              {activeTab === "news" && <NewsTab />}
              {activeTab === "profile" && <ProfileTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-primary shadow-nav z-20"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all relative"
                  onClick={() => setActiveTab(tab.id)}
                  data-ocid="app.tab"
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                      isActive ? "bg-success" : "bg-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-success-foreground"
                          : "text-primary-foreground/60"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors leading-none ${
                      isActive ? "text-success" : "text-primary-foreground/60"
                    }`}
                  >
                    {tab.hindiLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
