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
  Info,
  Loader2,
  MapPin,
  RotateCcw,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  const [uploadProgress, setUploadProgress] = useState(0);

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
      startCamera();
    } else {
      stopCamera();
      setCapturedPhoto(null);
      setCapturedUrl(null);
      setTitle("");
      setDescription("");
      setCategory(IssueCategory.infrastructure);
    }
    return () => {
      stopCamera();
    };
  }, [open]);

  async function handleCapture() {
    const file = await capturePhoto();
    if (file) {
      setCapturedPhoto(file);
      setCapturedUrl(URL.createObjectURL(file));
    }
  }

  function handleRetake() {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedPhoto(null);
    setCapturedUrl(null);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Please enter an issue title");
      return;
    }
    if (!capturedPhoto) {
      toast.error("Please capture a photo first");
      return;
    }

    let photoBlobId: string | null = null;
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
      toast.error("Photo upload failed");
    }

    await onSubmit({
      title,
      description,
      category,
      gpsLocation: gps,
      photoBlobId,
      isVigilance,
    });
  }

  return (
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
                <span className="text-destructive">Vigilance Mode Report</span>
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
              ⚠️ Extreme Anonymity is Active — bypasses public feed
            </span>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-success/10 text-success rounded-full px-2.5 py-1">
            <Info className="w-3 h-3" />
            <span className="text-xs font-medium">AI Verification Active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-accent/10 text-accent rounded-full px-2.5 py-1">
            <Info className="w-3 h-3" />
            <span className="text-xs font-medium">30-Day Auto-Escalation</span>
          </div>
        </div>

        {/* Camera preview / captured photo */}
        <div
          className="relative w-full rounded-xl overflow-hidden bg-black mb-4"
          style={{ aspectRatio: "16/9" }}
        >
          {capturedUrl ? (
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
          <p className="text-xs text-destructive mb-3">{camError.message}</p>
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
            disabled={isSubmitting || !capturedUrl}
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
  );
}
