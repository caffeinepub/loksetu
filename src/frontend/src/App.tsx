import { Toaster } from "@/components/ui/sonner";
import { Bell, MapPin, Newspaper, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import CitySelectorSheet from "./components/CitySelectorSheet";
import NotificationsSheet from "./components/NotificationsSheet";
import ProfileOverlay from "./components/ProfileOverlay";
import { NavStackProvider } from "./hooks/useNavStack";
import NagrikTab from "./pages/NagrikTab";
import NewsTab from "./pages/NewsTab";
import ProfileTab from "./pages/ProfileTab";
import TalkUpTab from "./pages/TalkUpTab";
import { AppStoreProvider } from "./store/appStore";
import { seedIfEmpty } from "./utils/seedData";

type Tab = "nagrik" | "news" | "talkup" | "profile";

const USER_NAME_KEY = "loksetu_userName";
const USER_AVATAR_KEY = "loksetu_userAvatar";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function TalkUpIcon({ isActive }: { isActive: boolean }) {
  return (
    <img
      src="/assets/generated/talkup-logo-transparent.dim_96x96.png"
      alt="TalkUp"
      className="w-5 h-5 object-contain"
      style={{ opacity: isActive ? 1 : 0.5 }}
    />
  );
}

function getStoredCity(): string {
  try {
    return localStorage.getItem("selectedCity") ?? "Delhi";
  } catch {
    return "Delhi";
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("nagrik");
  const [selectedCity, setSelectedCity] = useState<string>(getStoredCity);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Global user name & avatar — persisted to localStorage
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem(USER_NAME_KEY) ?? "Nagrik",
  );
  const [userAvatar, setUserAvatar] = useState<string>(
    () => localStorage.getItem(USER_AVATAR_KEY) ?? "",
  );

  function handleNameChange(newName: string) {
    const trimmed = newName.trim() || "Nagrik";
    setUserName(trimmed);
    try {
      localStorage.setItem(USER_NAME_KEY, trimmed);
    } catch {}
  }

  function handleAvatarChange(dataUrl: string) {
    setUserAvatar(dataUrl);
    try {
      localStorage.setItem(USER_AVATAR_KEY, dataUrl);
    } catch {}
  }

  // Seed data on first load
  useEffect(() => {
    seedIfEmpty();
  }, []);

  function handleSelectCity(city: string) {
    setSelectedCity(city);
    try {
      localStorage.setItem("selectedCity", city);
    } catch {}
  }

  function handleBellClick() {
    setHasUnread(false);
    setNotificationsOpen(true);
  }

  const TABS: { id: Tab; label: string; hindiLabel: string }[] = [
    {
      id: "nagrik",
      label: "Nagrik",
      hindiLabel: "\u0928\u093e\u0917\u0930\u093f\u0915",
    },
    {
      id: "news",
      label: "News",
      hindiLabel: "\u0938\u092e\u093e\u091a\u093e\u0930",
    },
    {
      id: "talkup",
      label: "TalkUp",
      hindiLabel: "\u091f\u0949\u0915\u0905\u092a",
    },
    {
      id: "profile",
      label: "Profile",
      hindiLabel: "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
    },
  ];

  const TAB_ICONS: Record<Tab, React.ReactNode> = {
    nagrik: <MapPin className="w-4 h-4" />,
    news: <Newspaper className="w-4 h-4" />,
    talkup: <TalkUpIcon isActive={activeTab === "talkup"} />,
    profile: <User className="w-4 h-4" />,
  };

  const initials = getInitials(userName);

  return (
    <AppStoreProvider>
      <NavStackProvider>
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

                  {/* City Selector Chip */}
                  <button
                    type="button"
                    className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 rounded-full px-2.5 py-1 hover:bg-accent/20 transition-colors flex-shrink-0"
                    onClick={() => setCitySelectorOpen(true)}
                    data-ocid="app.button"
                  >
                    <MapPin className="w-3 h-3 text-accent" />
                    <span className="text-xs font-semibold text-accent max-w-[70px] truncate">
                      {selectedCity}
                    </span>
                  </button>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Bell */}
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center relative"
                    onClick={handleBellClick}
                    data-ocid="app.secondary_button"
                  >
                    <Bell className="w-4 h-4 text-foreground" />
                    {hasUnread && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent rounded-full" />
                    )}
                  </button>

                  {/* Profile Circle — shows user avatar or initials */}
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full gradient-saffron flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
                    onClick={() => setProfileOpen(true)}
                    data-ocid="app.open_modal_button"
                  >
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">
                        {initials || "N"}
                      </span>
                    )}
                  </button>
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
                  {activeTab === "nagrik" && (
                    <NagrikTab selectedCity={selectedCity} />
                  )}
                  {activeTab === "news" && (
                    <NewsTab selectedCity={selectedCity} />
                  )}
                  {activeTab === "talkup" && (
                    <TalkUpTab selectedCity={selectedCity} />
                  )}
                  {activeTab === "profile" && (
                    <ProfileTab
                      userName={userName}
                      userAvatar={userAvatar}
                      onNameChange={handleNameChange}
                      onAvatarChange={handleAvatarChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <nav
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-primary shadow-nav z-20"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="flex items-center justify-around px-1 py-1.5">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative"
                      onClick={() => setActiveTab(tab.id)}
                      data-ocid={`app.${tab.id}.tab`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                          isActive ? "bg-success" : "bg-transparent"
                        }`}
                      >
                        <span
                          className={`transition-colors ${
                            isActive
                              ? "text-success-foreground"
                              : "text-primary-foreground/60"
                          }`}
                        >
                          {TAB_ICONS[tab.id]}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-medium transition-colors leading-none ${
                          isActive
                            ? "text-success"
                            : "text-primary-foreground/60"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Overlays */}
            <CitySelectorSheet
              open={citySelectorOpen}
              onClose={() => setCitySelectorOpen(false)}
              selectedCity={selectedCity}
              onSelectCity={handleSelectCity}
            />
            <NotificationsSheet
              open={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
            <ProfileOverlay
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
              selectedCity={selectedCity}
            />
            <Toaster position="top-center" richColors />
          </div>
        </div>
      </NavStackProvider>
    </AppStoreProvider>
  );
}
