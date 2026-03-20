import { Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface UserProfileSheetProps {
  open: boolean;
  onClose: () => void;
  displayName: string;
  city: string;
  isAnonymous: boolean;
  postCount?: number;
}

export default function UserProfileSheet({
  open,
  onClose,
  displayName,
  city,
  isAnonymous,
  postCount = 0,
}: UserProfileSheetProps) {
  function initials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={onClose}
          />
          <motion.div
            key="profile-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-card rounded-t-2xl z-[81] shadow-nav pb-safe"
            data-ocid="profile.sheet"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header close */}
            <div className="flex items-center justify-between px-4 pb-2">
              <span className="text-sm font-bold text-foreground">Profile</span>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={onClose}
                data-ocid="profile.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile content */}
            <div className="px-4 pb-8">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4">
                {isAnonymous ? (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border mb-3">
                    <Shield className="w-9 h-9 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full gradient-saffron flex items-center justify-center mb-3 shadow-md">
                    <span className="text-2xl font-extrabold text-white">
                      {initials(displayName)}
                    </span>
                  </div>
                )}

                {/* Name + badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-foreground">
                    {displayName}
                  </span>
                  {isAnonymous && (
                    <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                      <Shield className="w-3 h-3" /> Anonymous
                    </span>
                  )}
                </div>

                {/* Subtitle */}
                <p className="text-xs text-muted-foreground mb-2">
                  {isAnonymous ? "Anonymous Reporter" : "Civic Contributor"}
                </p>

                {/* City chip */}
                <span className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
                  📍 {city}
                </span>
              </div>

              {/* Stats */}
              <div className="bg-muted/50 rounded-xl px-4 py-3 mb-3 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-xl font-extrabold text-foreground">
                    {postCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Posts / Reports
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                {isAnonymous
                  ? "This citizen prefers to remain anonymous while contributing to civic welfare."
                  : `Contributing to civic welfare in ${city} and beyond. 🇮🇳`}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
