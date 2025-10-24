import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";

interface FaceVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmbedding?: number[];
  onVerified: () => void;
  onEnroll?: (embedding: number[]) => Promise<void> | void;
}

export const FaceVerification: React.FC<FaceVerificationProps> = ({
  open,
  onOpenChange,
  existingEmbedding,
  onVerified,
  onEnroll,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!open) return;

    const setup = async () => {
      try {
        // Load models from CDN to avoid bundling local files
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/face-api.js/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Face API models failed to load", err);
        toast.error("Failed to load face models");
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream as any;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        console.error("Camera access error", err);
        toast.error("Cannot access camera");
      }
    };

    setup();

    return () => {
      // Stop camera on close
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks();
      tracks?.forEach((t) => t.stop());
      setCameraReady(false);
    };
  }, [open]);

  const computeDescriptor = async (): Promise<number[] | null> => {
    if (!videoRef.current) return null;
    const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 });
    const result = await faceapi
      .detectSingleFace(videoRef.current, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result || !result.descriptor) {
      return null;
    }
    return Array.from(result.descriptor);
  };

  const euclideanDistance = (a: number[], b: number[]) => {
    if (a.length !== b.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  };

  const handleScan = async () => {
    if (!modelsLoaded) {
      toast.error("Models not loaded yet");
      return;
    }
    setIsScanning(true);
    try {
      const descriptor = await computeDescriptor();
      if (!descriptor) {
        toast.error("No face detected. Try again.");
        return;
      }

      if (!existingEmbedding || existingEmbedding.length === 0) {
        toast.error("No enrolled face found. Please enroll your face.");
        return;
      }

      const distance = euclideanDistance(descriptor, existingEmbedding);
      // Typical threshold ~0.6 for face-api descriptors
      const matched = distance <= 0.6;
      if (matched) {
        toast.success("Face verified");
        onVerified();
        onOpenChange(false);
      } else {
        toast.error("User is not same. Verification failed.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Face scan error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleEnroll = async () => {
    if (!modelsLoaded) {
      toast.error("Models not loaded yet");
      return;
    }
    setIsScanning(true);
    try {
      const descriptor = await computeDescriptor();
      if (!descriptor) {
        toast.error("No face detected. Try again.");
        return;
      }
      await onEnroll?.(descriptor);
      toast.success("Face enrolled successfully");
    } catch (err) {
      console.error(err);
      toast.error("Face enrollment error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Face Verification</DialogTitle>
          <DialogDescription>
            {existingEmbedding && existingEmbedding.length > 0
              ? "Align your face in the frame and scan to verify."
              : "No face enrolled yet. Enroll your face before verification."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
            <video ref={videoRef} className="w-full h-full" muted playsInline />
          </div>
          <div className="text-sm text-gray-500">
            {modelsLoaded ? "Models loaded" : "Loading models..."} · {cameraReady ? "Camera ready" : "Initializing camera..."}
          </div>
        </div>
        <DialogFooter>
          {existingEmbedding && existingEmbedding.length > 0 ? (
            <Button onClick={handleScan} disabled={!modelsLoaded || !cameraReady || isScanning} className="w-full">
              {isScanning ? "Scanning..." : "Scan Face"}
            </Button>
          ) : (
            <Button onClick={handleEnroll} disabled={!modelsLoaded || !cameraReady || isScanning} className="w-full">
              {isScanning ? "Enrolling..." : "Enroll Face"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};