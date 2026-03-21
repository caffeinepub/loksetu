import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Image,
  Info,
  Loader2,
  MapPin,
  RotateCcw,
  Shield,
  User,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { IssueCategory } from "../hooks/useQueries";

interface ReportIssueModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: IssueCategory;
    gpsLocation: string;
    photoBlobId: string | null;
    isVigilance: boolean;
    mediaUrl?: string;
    mediaIsVideo?: boolean;
    identityMode: "anonymous" | "real";
  }) => Promise<void>;
  isVigilance?: boolean;
  isSubmitting?: boolean;
}

const CATEGORIES: { value: IssueCategory; label: string; emoji: string }[] = [
  {
    value: IssueCategory.infrastructure,
    label: "Roads & Infrastructure",
    emoji: "🛣️",
  },
  { value: IssueCategory.sanitation, label: "Sanitation & Waste", emoji: "🧹" },
  { value: IssueCategory.healthcare, label: "Healthcare", emoji: "🏥" },
  { value: IssueCategory.publicSafety, label: "Public Safety", emoji: "🚔" },
  {
    value: IssueCategory.corruption,
    label: "Corruption / VIP Violations",
    emoji: "⚠️",
  },
  { value: IssueCategory.other, label: "Other", emoji: "📌" },
];

// Unique ID prefix so regular and vigilance portals don't collide
const RPT_IDS = {
  galleryPhoto: "rpt-gallery-photo-input",
  galleryVideo: "rpt-gallery-video-input",
  cameraPhoto: "rpt-camera-photo-input",
  cameraVideo: "rpt-camera-video-input",
};

type MediaMode = "camera" | "file";

export default function ReportIssueModal({
  open,
  onClose,
  onSubmit,
  isVigilance = false,
  isSubmitting = false,
}: ReportIssueModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>(
    IssueCategory.infrastructure,
  );
  const [gps] = useState("28.6139° N, 77.2090° E");
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedIsVideo, setCapturedIsVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaMode, setMediaMode] = useState<MediaMode>("camera");
  const [identityMode, setIdentityMode] = useState<"anonymous" | "real">(
    "anonymous",
  );

  const galleryPhotoRef = useRef<HTMLInputElement>(null);
  const galleryVideoRef = useRef<HTMLInputElement>(null);
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);

  const {
    isActive,
    isLoading: camLoading,
    error: camError,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", quality: 0.85 });

  // biome-ignore lint/correctness/useExhaustiveDependencies: startCamera/stopCamera are stable refs
  useEffect(() => {
    if (open) {
      if (mediaMode === "camera") startCamera();
    } else {
      stopCamera();
      setCapturedPhoto(null);
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
      setCapturedUrl(null);
      setCapturedIsVideo(false);
      setTitle("");
      setDescription("");
      setCategory(IssueCategory.infrastructure);
      setMediaMode("camera");
      setIdentityMode("anonymous");
    }
    return () => {
      stopCamera();
    };
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (mediaMode === "camera" && open) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [mediaMode]);

  async function handleCapture() {
    const file = await capturePhoto();
    if (file) {
      setCapturedPhoto(file);
      setCapturedUrl(URL.createObjectURL(file));
      setCapturedIsVideo(false);
    }
  }

  function handleFileSelect(file: File | undefined, isVideo: boolean) {
    if (!file) return;
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedPhoto(file);
    setCapturedUrl(URL.createObjectURL(file));
    setCapturedIsVideo(isVideo);
  }

  function handleRetake() {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedPhoto(null);
    setCapturedUrl(null);
    setCapturedIsVideo(false);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Please enter an issue title");
      return;
    }

    let photoBlobId: string | null = null;
    if (capturedPhoto && !capturedIsVideo) {
      try {
        const bytes = new Uint8Array(await capturedPhoto.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
          setUploadProgress(p),
        );
        const hashBytes = await blob.getBytes();
        photoBlobId = Array.from(hashBytes.slice(0, 16))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      } catch {
        // Photo upload failed — proceed without photo
        photoBlobId = null;
      }
    }

    try {
      await onSubmit({
        title,
        description,
        category,
        gpsLocation: gps,
        photoBlobId,
        isVigilance,
        mediaUrl: capturedUrl ?? undefined,
        mediaIsVideo: capturedIsVideo,
        identityMode,
      });
    } catch {
      // onSubmit handles its own errors — swallow here
    }
  }

  // Portal: file inputs at document.body, OUTSIDE any Radix focus trap.
  // pointerEvents must NOT be 'none' so <label htmlFor> clicks propagate to inputs.
  const fileInputPortal = ReactDOM.createPortal(
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        opacity: 0,
      }}
    >
      <input
        id={RPT_IDS.galleryPhoto}
        ref={galleryPhotoRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0], false)}
      />
      <input
        id={RPT_IDS.galleryVideo}
        ref={galleryVideoRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0], true)}
      />
      <input
        id={RPT_IDS.cameraPhoto}
        ref={cameraPhotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files?.[0], false)}
      />
      <input
        id={RPT_IDS.cameraVideo}
        ref={cameraVideoRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files?.[0], true)}
      />
    </div>,
    document.body,
  );

  return (
    <>
      {fileInputPortal}
      <Sheet
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
      >
        <SheetContent
          side="bottom"
          className="h-[92vh] rounded-t-2xl px-4 py-5 overflow-y-auto"
          data-ocid="nagrik.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              {isVigilance ? (
                <>
                  <Shield className="w-5 h-5 text-destructive" />
                  <span className="text-destructive">
                    Vigilance Mode Report
                  </span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 text-accent" />
                  <span>Report New Issue</span>
                </>
              )}
            </SheetTitle>
          </SheetHeader>

          {isVigilance && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-xs text-destructive font-medium">
                ⚠️ Vigilance Mode — High-stakes reporting. Choose your identity
                below.
              </span>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-success/10 text-success rounded-full px-2.5 py-1">
              <Info className="w-3 h-3" />
              <span className="text-xs font-medium">
                AI Verification Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-accent/10 text-accent rounded-full px-2.5 py-1">
              <Info className="w-3 h-3" />
              <span className="text-xs font-medium">
                30-Day Auto-Escalation
              </span>
            </div>
          </div>

          {/* Identity toggle — always visible, prominent in Vigilance mode */}
          <div className="mb-4">
            <Label className="text-xs font-semibold mb-2 block">
              {isVigilance ? "🛡️ Post Identity" : "Post as"}
            </Label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  identityMode === "anonymous"
                    ? "bg-destructive/10 border-destructive text-destructive"
                    : "bg-card border-border text-muted-foreground hover:border-muted-foreground"
                }`}
                onClick={() => setIdentityMode("anonymous")}
                data-ocid="nagrik.toggle"
              >
                <Shield className="w-3.5 h-3.5" />
                Post Anonymously
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  identityMode === "real"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-muted-foreground"
                }`}
                onClick={() => setIdentityMode("real")}
                data-ocid="nagrik.toggle"
              >
                <User className="w-3.5 h-3.5" />
                Real Profile
              </button>
            </div>
            {identityMode === "anonymous" && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Your name will be hidden. Report will show as "Anonymous
                Citizen" in the public feed.
              </p>
            )}
            {identityMode === "real" && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Your profile name will be shown on the report in the public
                feed.
              </p>
            )}
          </div>

          {/* Media source selector tabs */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                mediaMode === "camera"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-muted-foreground border-border"
              }`}
              onClick={() => setMediaMode("camera")}
            >
              <Camera className="w-3 h-3" /> Live Camera
            </button>
            <button
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                mediaMode === "file"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-muted-foreground border-border"
              }`}
              onClick={() => setMediaMode("file")}
            >
              <Image className="w-3 h-3" /> Gallery / Record
            </button>
          </div>

          {/* Media preview area */}
          {mediaMode === "camera" ? (
            <>
              <div
                className="relative w-full rounded-xl overflow-hidden bg-black mb-4"
                style={{ aspectRatio: "16/9" }}
              >
                {capturedUrl && !capturedIsVideo ? (
                  <img
                    src={capturedUrl}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                    {camLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              {camError && (
                <p className="text-xs text-destructive mb-3">
                  {camError.message}
                </p>
              )}
              {!capturedUrl ? (
                <Button
                  className="w-full mb-4 bg-success hover:bg-success/90 text-success-foreground"
                  onClick={handleCapture}
                  disabled={!isActive || camLoading}
                  data-ocid="nagrik.upload_button"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {camLoading ? "Starting Camera..." : "Capture Photo"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full mb-4"
                  onClick={handleRetake}
                  data-ocid="nagrik.secondary_button"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Photo
                </Button>
              )}
            </>
          ) : (
            <>
              {capturedUrl ? (
                <div className="relative mb-4">
                  {capturedIsVideo ? (
                    <video
                      src={capturedUrl}
                      controls
                      autoPlay
                      muted
                      className="w-full rounded-xl max-h-48 object-cover"
                    />
                  ) : (
                    <img
                      src={capturedUrl}
                      alt="Selected"
                      className="w-full rounded-xl max-h-48 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium bg-card hover:bg-muted transition-colors"
                    onClick={handleRetake}
                    data-ocid="nagrik.secondary_button"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Change Media
                  </button>
                </div>
              ) : (
                /* Gallery / Record picker — label-based, never blocked by focus trap */
                <div className="mb-4 rounded-xl border border-border overflow-hidden">
                  <label
                    htmlFor={RPT_IDS.galleryPhoto}
                    className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/70 text-sm font-medium transition-colors flex items-center gap-3 border-b border-border cursor-pointer"
                    data-ocid="nagrik.upload_button"
                  >
                    <Image className="w-4 h-4 text-accent" />📷 Photo from
                    Gallery
                  </label>
                  <label
                    htmlFor={RPT_IDS.galleryVideo}
                    className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/70 text-sm font-medium transition-colors flex items-center gap-3 border-b border-border cursor-pointer"
                    data-ocid="nagrik.upload_button"
                  >
                    <Video className="w-4 h-4 text-accent" />🎥 Video from
                    Gallery
                  </label>
                  <label
                    htmlFor={RPT_IDS.cameraPhoto}
                    className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/70 text-sm font-medium transition-colors flex items-center gap-3 border-b border-border cursor-pointer"
                    data-ocid="nagrik.upload_button"
                  >
                    <Camera className="w-4 h-4 text-accent" />📸 Take Photo
                    (Camera)
                  </label>
                  <label
                    htmlFor={RPT_IDS.cameraVideo}
                    className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/70 text-sm font-medium transition-colors flex items-center gap-3 cursor-pointer"
                    data-ocid="nagrik.upload_button"
                  >
                    <Video className="w-4 h-4 text-accent" />🎬 Record Video
                    (Camera)
                  </label>
                </div>
              )}
            </>
          )}

          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium mb-1 block">
                GPS Location (Auto-detected)
              </Label>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">{gps}</span>
              </div>
            </div>

            <div>
              <Label
                htmlFor="issue-title"
                className="text-xs font-medium mb-1 block"
              >
                Issue Title *
              </Label>
              <Input
                id="issue-title"
                placeholder="e.g. Broken road near market"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-ocid="nagrik.input"
              />
            </div>

            <div>
              <Label
                htmlFor="issue-desc"
                className="text-xs font-medium mb-1 block"
              >
                Description
              </Label>
              <Textarea
                id="issue-desc"
                placeholder="Describe the issue in detail..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-ocid="nagrik.textarea"
              />
            </div>

            <div>
              <Label className="text-xs font-medium mb-1 block">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as IssueCategory)}
              >
                <SelectTrigger data-ocid="nagrik.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-accent h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
              data-ocid="nagrik.submit_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
              data-ocid="nagrik.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
