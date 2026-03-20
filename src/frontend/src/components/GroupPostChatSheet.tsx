import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, Send, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  mediaUrl?: string;
  mediaType?: "photo" | "video";
  timestamp: number;
  likes: number;
  dislikes: number;
  replyToId?: string;
  replyToText?: string;
  replyToAuthor?: string;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
}

interface GroupPostChatSheetProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  postText: string;
  postAuthor: string;
  canChat: boolean;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 24) return `${Math.floor(hrs / 24)}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function GroupPostChatSheet({
  open,
  onClose,
  postId,
  postText,
  postAuthor,
  canChat,
}: GroupPostChatSheetProps) {
  const storageKey = `loksetu_post_chat_${postId}`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<{
    url: string;
    type: "photo" | "video";
  } | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoLabelRef = useRef<HTMLLabelElement>(null);
  const videoLabelRef = useRef<HTMLLabelElement>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    if (!open) return;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setMessages(stored);
    } catch {
      setMessages([]);
    }
  }, [open, storageKey]);

  function saveMessages(msgs: ChatMessage[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(msgs.slice(-500)));
    } catch {}
  }

  function handleSend() {
    if (!inputText.trim() && !mediaPreview) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      author: "You",
      text: inputText.trim(),
      mediaUrl: mediaPreview?.url,
      mediaType: mediaPreview?.type,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      replyToId: replyingTo?.id,
      replyToText: replyingTo?.text,
      replyToAuthor: replyingTo?.author,
    };
    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(updated);
    setInputText("");
    setMediaPreview(null);
    setReplyingTo(null);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }

  function handleLike(msgId: string) {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== msgId) return m;
        const wasLiked = m.likedByMe;
        return {
          ...m,
          likes: wasLiked ? m.likes - 1 : m.likes + 1,
          likedByMe: !wasLiked,
          dislikes: m.dislikedByMe ? m.dislikes - 1 : m.dislikes,
          dislikedByMe: false,
        };
      });
      saveMessages(updated);
      return updated;
    });
  }

  function handleDislike(msgId: string) {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== msgId) return m;
        const wasDisliked = m.dislikedByMe;
        return {
          ...m,
          dislikes: wasDisliked ? m.dislikes - 1 : m.dislikes + 1,
          dislikedByMe: !wasDisliked,
          likes: m.likedByMe ? m.likes - 1 : m.likes,
          likedByMe: false,
        };
      });
      saveMessages(updated);
      return updated;
    });
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "video",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type });
    setMediaPickerOpen(false);
    e.target.value = "";
  }

  if (!open) return null;

  // Root-level portal for file inputs — outside any focus trap
  const filePortal = ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <label ref={photoLabelRef} htmlFor="gpc-photo-input">
        <span className="sr-only">Photo</span>
      </label>
      <input
        ref={photoInputRef}
        id="gpc-photo-input"
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "photo")}
      />
      <label ref={videoLabelRef} htmlFor="gpc-video-input">
        <span className="sr-only">Video</span>
      </label>
      <input
        ref={videoInputRef}
        id="gpc-video-input"
        type="file"
        accept="video/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "video")}
      />
    </div>,
    document.body,
  );

  return (
    <>
      {filePortal}
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-card rounded-t-2xl z-50 shadow-nav flex flex-col"
        style={{ height: "88vh" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarFallback className="text-[10px] bg-accent/10 text-accent font-bold">
              {initials(postAuthor)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground">{postAuthor}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {postText.slice(0, 80)}
              {postText.length > 80 ? "..." : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
            data-ocid="group_chat.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        >
          {messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full py-10"
              data-ocid="group_chat.empty_state"
            >
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm text-muted-foreground text-center">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2"
              >
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {initials(msg.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-foreground">
                      {msg.author}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(msg.timestamp)}
                    </span>
                  </div>

                  {/* Reply quote */}
                  {msg.replyToId && (
                    <div className="bg-muted/60 border-l-2 border-accent rounded px-2 py-1 mb-1">
                      <p className="text-[10px] font-semibold text-accent">
                        {msg.replyToAuthor}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {msg.replyToText}
                      </p>
                    </div>
                  )}

                  {/* Text */}
                  {msg.text && (
                    <p className="text-sm text-foreground leading-snug">
                      {msg.text}
                    </p>
                  )}

                  {/* Media */}
                  {msg.mediaType === "photo" && msg.mediaUrl && (
                    <img
                      src={msg.mediaUrl}
                      alt="chat media"
                      className="w-full max-h-48 object-cover rounded-lg mt-1.5"
                    />
                  )}
                  {msg.mediaType === "video" && msg.mediaUrl && (
                    // biome-ignore lint/a11y/useMediaCaption: user chat video
                    <video
                      src={msg.mediaUrl}
                      controls
                      playsInline
                      className="w-full max-h-48 rounded-lg mt-1.5"
                    />
                  )}

                  {/* Reactions row */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      type="button"
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        msg.likedByMe
                          ? "text-accent"
                          : "text-muted-foreground hover:text-accent"
                      }`}
                      onClick={() => handleLike(msg.id)}
                      data-ocid="group_chat.toggle"
                    >
                      <ThumbsUp
                        className={`w-3 h-3 ${msg.likedByMe ? "fill-accent" : ""}`}
                      />
                      <span>{msg.likes}</span>
                    </button>
                    <button
                      type="button"
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        msg.dislikedByMe
                          ? "text-destructive"
                          : "text-muted-foreground hover:text-destructive"
                      }`}
                      onClick={() => handleDislike(msg.id)}
                      data-ocid="group_chat.toggle"
                    >
                      <ThumbsDown
                        className={`w-3 h-3 ${msg.dislikedByMe ? "fill-destructive" : ""}`}
                      />
                      <span>{msg.dislikes}</span>
                    </button>
                    <button
                      type="button"
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors ml-auto"
                      onClick={() => setReplyingTo(msg)}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border">
          {/* Reply preview bar */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 border-b border-accent/20"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-accent">
                    Replying to {replyingTo.author}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {replyingTo.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Media preview */}
          <AnimatePresence>
            {mediaPreview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-3 py-1.5 flex items-center gap-2"
              >
                {mediaPreview.type === "photo" ? (
                  <img
                    src={mediaPreview.url}
                    alt="preview"
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  // biome-ignore lint/a11y/useMediaCaption: preview video
                  <video
                    src={mediaPreview.url}
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  {mediaPreview.type === "photo" ? "Photo" : "Video"} ready to
                  send
                </p>
                <button
                  type="button"
                  onClick={() => setMediaPreview(null)}
                  className="ml-auto text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {canChat ? (
            <div className="flex items-center gap-2 px-3 py-2.5">
              {/* Media picker button */}
              <div className="relative">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
                  onClick={() => setMediaPickerOpen((v) => !v)}
                  data-ocid="group_chat.upload_button"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Media type picker dropdown */}
                <AnimatePresence>
                  {mediaPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute bottom-10 left-0 bg-card border border-border rounded-xl shadow-lg z-10 w-44 py-1 overflow-hidden"
                    >
                      {[
                        {
                          label: "📷 Photo from Gallery",
                          id: "gpc-photo-input",
                        },
                        {
                          label: "🎥 Video from Gallery",
                          id: "gpc-video-input",
                        },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          htmlFor={opt.id}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted cursor-pointer"
                          onClick={() => setMediaPickerOpen(false)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setMediaPickerOpen(false)
                          }
                        >
                          {opt.label}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message..."
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                data-ocid="group_chat.input"
              />
              <Button
                size="sm"
                className="w-9 h-9 p-0 rounded-full"
                onClick={handleSend}
                disabled={!inputText.trim() && !mediaPreview}
                data-ocid="group_chat.submit_button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">
                {"Join the community to chat or admins have disabled messaging"}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
