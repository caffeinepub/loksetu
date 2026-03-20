import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertCircle,
  Heart,
  MessageCircle,
  Reply,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const NOTIFICATIONS = [
  {
    id: 1,
    text: "Rajesh Kumar liked your post",
    time: "2m ago",
    icon: Heart,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
  },
  {
    id: 2,
    text: "Priya Sharma replied to your civic report",
    time: "15m ago",
    icon: Reply,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    id: 3,
    text: "3 new members joined Nagrik Community",
    time: "1h ago",
    icon: Users,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
  {
    id: 4,
    text: "Your report on MG Road pothole is Verified ✓",
    time: "3h ago",
    icon: Shield,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
  {
    id: 5,
    text: "Amit Singh commented on your post",
    time: "5h ago",
    icon: MessageCircle,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    id: 6,
    text: "Your report has been Auto-Escalated 🔴",
    time: "1d ago",
    icon: AlertCircle,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
  },
];

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsSheet({
  open,
  onClose,
}: NotificationsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold">Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(80vh-80px)]">
          <div className="space-y-1 pb-4">
            {NOTIFICATIONS.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer"
                data-ocid={`notifications.item.${i + 1}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}
                >
                  <notif.icon className={`w-4 h-4 ${notif.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {notif.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notif.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
