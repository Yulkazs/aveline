"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  active: boolean;
  torch: boolean;
  onScan: (productId: string) => void;
};

type CameraStatus =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "unavailable"
  | "error";

export default function ScannerView({ active, torch, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<import("@zxing/browser").BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef(false);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [linePos, setLinePos] = useState(0);
  const [lineDir, setLineDir] = useState<1 | -1>(1);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate scan line
  useEffect(() => {
    if (!active || status !== "active") return;
    animRef.current = setInterval(() => {
      setLinePos((p) => {
        const next = p + lineDir * 1.2;
        if (next >= 100) { setLineDir(-1); return 100; }
        if (next <= 0)   { setLineDir(1);  return 0;   }
        return next;
      });
    }, 16);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, status]);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    readerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("requesting");
    setErrorMsg(null);

    // Dynamically import ZXing (loaded from npm bundle via Next.js)
    let BrowserMultiFormatReader: typeof import("@zxing/browser").BrowserMultiFormatReader;
    let NotFoundException: typeof import("@zxing/library").NotFoundException;
    try {
      const zxingBrowser = await import("@zxing/browser");
      const zxingLibrary = await import("@zxing/library");
      BrowserMultiFormatReader = zxingBrowser.BrowserMultiFormatReader;
      NotFoundException = zxingLibrary.NotFoundException;
    } catch {
      setStatus("error");
      setErrorMsg(
        "Barcode-scannerbibliotheek kon niet worden geladen. Zorg dat @zxing/browser is geïnstalleerd."
      );
      return;
    }

    // Request camera permission
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err: unknown) {
      const name = (err as Error)?.name;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setStatus("denied");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setStatus("unavailable");
        setErrorMsg("Geen camera gevonden op dit apparaat.");
      } else {
        setStatus("error");
        setErrorMsg("Camera kon niet worden gestart: " + (err as Error)?.message);
      }
      return;
    }

    streamRef.current = stream;

    if (!videoRef.current) {
      stopCamera();
      return;
    }

    videoRef.current.srcObject = stream;
    await videoRef.current.play().catch(() => {});

    // Handle torch
    const track = stream.getVideoTracks()[0];
    if (torch && track) {
      try {
        await (track as MediaStreamTrack & { applyConstraints: (c: object) => Promise<void> })
          .applyConstraints({ advanced: [{ torch: true }] } as object);
      } catch { /* torch not supported */ }
    }

    setStatus("active");
    scanningRef.current = true;

    // Set up ZXing reader
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    // Decode loop
    const decode = async () => {
      if (!scanningRef.current || !videoRef.current) return;
      try {
        const result = await reader.decodeOnceFromVideoElement(videoRef.current);
        if (result && scanningRef.current) {
          scanningRef.current = false;
          onScan(result.getText());
        }
      } catch (err) {
        // NotFoundException is normal (no barcode in frame yet), keep looping
        if (err instanceof NotFoundException || (err as Error)?.name === "NotFoundException") {
          if (scanningRef.current) requestAnimationFrame(decode);
        } else if (scanningRef.current) {
          // Other errors: retry after short delay
          setTimeout(decode, 500);
        }
      }
    };

    requestAnimationFrame(decode);
  }, [torch, onScan, stopCamera]);

  // Start/stop camera when `active` changes
  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
      setStatus("idle");
    }
    return () => stopCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Handle torch toggle while camera is running
  useEffect(() => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      (track as MediaStreamTrack & { applyConstraints: (c: object) => Promise<void> })
        .applyConstraints({ advanced: [{ torch }] } as object)
        .catch(() => {});
    } catch { /* ignore */ }
  }, [torch]);

  // ─── Render states ────────────────────────────────────────────────────────

  if (status === "denied") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6 px-8 text-center"
        style={{ background: "#0a0a0a" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ background: "rgba(220,38,38,0.15)" }}>
          🚫
        </div>
        <div>
          <p className="text-white font-semibold text-lg mb-2">Cameratoegang geweigerd</p>
          <p className="text-sm" style={{ color: "#9aada2" }}>
            Zonder cameratoegang kan de scanner niet werken.
          </p>
        </div>
        <div className="rounded-2xl p-4 text-left w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold mb-2 text-white">Zo schakel je toestemming in:</p>
          <ol className="text-xs space-y-1.5" style={{ color: "#9aada2" }}>
            <li>1. Open <strong className="text-white">Instellingen</strong> op je apparaat</li>
            <li>2. Ga naar <strong className="text-white">Privacy → Camera</strong></li>
            <li>3. Geef deze browser toegang tot de camera</li>
            <li>4. Laad deze pagina opnieuw</li>
          </ol>
        </div>
        <button
          onClick={() => { setStatus("idle"); startCamera(); }}
          className="px-6 py-3 rounded-full text-sm font-semibold"
          style={{ background: "#304C3A", color: "#ffffff" }}
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (status === "unavailable" || status === "error") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-8 text-center"
        style={{ background: "#0a0a0a" }}>
        <div className="text-4xl">📷</div>
        <p className="text-white font-semibold">Camera niet beschikbaar</p>
        <p className="text-sm" style={{ color: "#9aada2" }}>
          {errorMsg ?? "Er is een probleem opgetreden met de camera."}
        </p>
        <button
          onClick={() => { setStatus("idle"); startCamera(); }}
          className="px-6 py-3 rounded-full text-sm font-semibold mt-2"
          style={{ background: "#304C3A", color: "#ffffff" }}
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "#0a0a0a" }}>
      {/* Live video feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
        style={{ display: status === "active" ? "block" : "none" }}
      />

      {/* Loading overlay */}
      {(status === "idle" || status === "requesting") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: "#0a0a0a" }}>
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#51C675", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "#9aada2" }}>
            {status === "requesting" ? "Camera wordt gestart..." : "Initialiseren..."}
          </p>
        </div>
      )}

      {/* Vignette */}
      {status === "active" && (
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
      )}

      {/* Viewport cutout */}
      {status === "active" && (
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -55%)",
            width: "68%",
            aspectRatio: "1",
          }}
        >
          {/* Clear area */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(0,0,0,0.01)",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
            }}
          >
            {/* Scan line */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${linePos}%`,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent 0%, #51C675 20%, #51C675 80%, transparent 100%)",
                boxShadow: "0 0 8px #51C675",
                transition: "top 16ms linear",
              }}
            />
          </div>

          {/* Corner markers */}
          {(["tl", "tr", "bl", "br"] as const).map((pos) => (
            <div
              key={pos}
              className="absolute"
              style={{
                width: 22,
                height: 22,
                top:    pos.startsWith("t") ? -1 : undefined,
                bottom: pos.startsWith("b") ? -1 : undefined,
                left:   pos.endsWith("l")   ? -1 : undefined,
                right:  pos.endsWith("r")   ? -1 : undefined,
                borderTop:    pos.startsWith("t") ? "3px solid #51C675" : undefined,
                borderBottom: pos.startsWith("b") ? "3px solid #51C675" : undefined,
                borderLeft:   pos.endsWith("l")   ? "3px solid #51C675" : undefined,
                borderRight:  pos.endsWith("r")   ? "3px solid #51C675" : undefined,
                borderRadius:
                  pos === "tl" ? "6px 0 0 0" :
                  pos === "tr" ? "0 6px 0 0" :
                  pos === "bl" ? "0 0 0 6px" : "0 0 6px 0",
              }}
            />
          ))}
        </div>
      )}

      {/* Status indicator */}
      {status === "active" && (
        <div
          className="absolute flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            top: "60%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.5)",
            marginTop: 16,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#51C675",
              flexShrink: 0,
              animation: "pulse 1.5s infinite",
            }}
          />
          <span className="text-xs font-medium text-white">
            Richt de camera op een barcode…
          </span>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}