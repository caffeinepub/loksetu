import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  Chrome,
  Edit2,
  Loader2,
  Lock,
  LogOut,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { UserRole, useCallerRole, useUserStats } from "../hooks/useQueries";

const MAX_REPORTS = 50;

export default function ProfileTab() {
  const { data: role, isLoading: roleLoading } = useCallerRole();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("Rohan Sharma");
  const [nameInput, setNameInput] = useState("Rohan Sharma");

  const isGuest = role === UserRole.guest || (!identity && !roleLoading);
  const reportsCount = Number(stats?.reportsCount ?? 12);
  const progressPct = Math.min((reportsCount / MAX_REPORTS) * 100, 100);
  const certificateUnlocked =
    stats?.unlockedCertificate ?? reportsCount >= MAX_REPORTS;

  if (roleLoading) {
    return (
      <div className="p-4 space-y-4" data-ocid="profile.loading_state">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full gradient-saffron flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="text-4xl">🏛️</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Loksetu</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Login to report civic issues and earn the Satark Nagrik Pramanpatra.
          </p>

          <div className="space-y-3 w-full max-w-xs">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => {
                toast.info("Phone OTP login — coming soon!");
              }}
              data-ocid="profile.primary_button"
            >
              <Phone className="w-4 h-4" />
              Login with Phone OTP
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              data-ocid="profile.secondary_button"
            >
              {loginStatus === "logging-in" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Chrome className="w-4 h-4" />
              )}
              Continue with Internet Identity
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {/* User Avatar + Name */}
      <div className="gradient-saffron mx-4 mt-4 rounded-2xl p-4 text-white mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center text-2xl font-bold">
            {displayName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  className="h-8 text-sm text-foreground"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  data-ocid="profile.input"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-3"
                  onClick={() => {
                    setDisplayName(nameInput);
                    setEditingName(false);
                    toast.success("Name updated!");
                  }}
                  data-ocid="profile.save_button"
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base truncate">{displayName}</h3>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  data-ocid="profile.edit_button"
                >
                  <Edit2 className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            )}
            <p className="text-xs opacity-80 mt-0.5">
              {identity
                ? `${identity.getPrincipal().toString().slice(0, 20)}...`
                : "+91 98765 43210"}
            </p>
          </div>
        </div>
      </div>

      {/* Milestone Tracker */}
      <div className="mx-4 mb-4 bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">
            🏆 Milestone Tracker
          </h3>
          <span className="text-xs text-muted-foreground">Satark Nagrik</span>
        </div>
        {statsLoading ? (
          <Skeleton className="h-6 w-full" data-ocid="profile.loading_state" />
        ) : (
          <>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span className="font-medium text-foreground">
                {reportsCount} / {MAX_REPORTS} Verified Reports
              </span>
              <span className="text-accent font-semibold">
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="relative w-full h-3 bg-primary/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-accent rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {MAX_REPORTS - reportsCount > 0
                ? `${MAX_REPORTS - reportsCount} more reports to unlock certificate`
                : "🎉 Certificate unlocked!"}
            </p>
          </>
        )}
      </div>

      {/* Certificate Card */}
      <div className="mx-4 mb-4">
        <h3 className="text-sm font-bold text-foreground mb-2">
          📜 Satark Nagrik Pramanpatra
        </h3>
        <div
          className={`rounded-xl p-4 border-2 ${certificateUnlocked ? "border-success bg-success/5" : "border-border bg-muted/50"}`}
          data-ocid="profile.card"
        >
          {certificateUnlocked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-success" />
              </div>
              <div>
                <p className="font-bold text-success text-sm">
                  Certificate Unlocked! 🎉
                </p>
                <p className="text-xs text-success/80">
                  Satark Nagrik Pramanpatra
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {displayName} | {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Lock className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-muted-foreground text-sm">
                  Certificate Locked
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete 50 verified reports to unlock the Good Citizen
                  Certificate
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="mx-4 bg-card rounded-xl border border-border overflow-hidden shadow-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Settings
          </p>
        </div>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
          onClick={() => setEditingName(true)}
          data-ocid="profile.edit_button"
        >
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Edit Display Name</span>
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-destructive/5 transition-colors text-left"
          onClick={() => {
            clear();
            toast.success("Logged out successfully");
          }}
          data-ocid="profile.delete_button"
        >
          <LogOut className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">Logout</span>
        </button>
      </div>
    </div>
  );
}
