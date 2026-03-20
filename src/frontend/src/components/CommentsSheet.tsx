import { MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
  isMe?: boolean;
}

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 1,
    author: "Priya S.",
    text: "This is really important — I've noticed the same problem near my area. Hope it gets resolved soon!",
    time: "2h ago",
  },
  {
    id: 2,
    author: "Nagrik #7412",
    text: "Reported this last week too. The municipality needs to act faster on these issues.",
    time: "1h ago",
  },
  {
    id: 3,
    author: "Rahul D.",
    text: "Shared this with our ward councillor. Let's hope for swift action. 🙏",
    time: "30m ago",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface CommentsSheetProps {
  open: boolean;
  onClose: () => void;
  postTitle: string;
  postType: "report" | "post" | "status";
}

export default function CommentsSheet({
  open,
  onClose,
  postTitle,
}: CommentsSheetProps) {
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [inputText, setInputText] = useState("");

  function handleSend() {
    if (!inputText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      author: "You",
      text: inputText.trim(),
      time: "just now",
      isMe: true,
    };
    setComments((prev) => [...prev, newComment]);
    setInputText("");
    toast.success("Comment sent!");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="comments-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={onClose}
          />
          <motion.div
            key="comments-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-card rounded-t-2xl z-[81] shadow-nav flex flex-col"
            style={{ height: "80vh" }}
            data-ocid="comments.sheet"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-4 py-2 border-b border-border flex-shrink-0">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-accent flex-shrink-0" />
                  <h3 className="text-sm font-bold text-foreground">
                    Comments
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {postTitle}
                </p>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0"
                onClick={onClose}
                data-ocid="comments.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {comments.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-2.5 ${
                    i % 2 === 1 ? "bg-muted/30 rounded-xl px-2 py-1" : ""
                  }`}
                  data-ocid={`comments.item.${i + 1}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      c.isMe
                        ? "gradient-saffron text-white"
                        : "bg-accent/15 text-accent"
                    }`}
                  >
                    {initials(c.author)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {c.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {c.time}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5 leading-snug">
                      {c.text}
                    </p>
                  </div>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <div
                  className="text-center py-10"
                  data-ocid="comments.empty_state"
                >
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-muted-foreground text-sm">
                    No comments yet. Be the first!
                  </p>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card flex-shrink-0 pb-safe">
              <div className="w-8 h-8 rounded-full gradient-saffron flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">Y</span>
              </div>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                data-ocid="comments.input"
              />
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                onClick={handleSend}
                disabled={!inputText.trim()}
                data-ocid="comments.submit_button"
              >
                <Send className="w-4 h-4 text-accent-foreground" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
