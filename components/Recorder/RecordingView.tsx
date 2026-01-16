
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Icons, POMODORO_WORK } from '../../constants.tsx';
import { StudioSettings, StudySession, FaceStickerType } from '../../types.ts';
import { storageService } from '../../services/storage.ts';

// @ts-ignore - MediaPipe imported via importMap
import * as faceDetectionModule from '@mediapipe/face_detection';

interface RecordingViewProps {
  settings: StudioSettings;
  onSessionComplete: (session: StudySession) => void;
  onRecordingStateChange: (recording: boolean) => void;
}

const RecordingView: React.FC<RecordingViewProps> = ({ settings, onSessionComplete, onRecordingStateChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const requestRef = useRef<number>(0);
  
  // Local Inference Refs
  const faceDetectorRef = useRef<any>(null);
  const lastFaceBoxRef = useRef<any>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const avatarImgRef = useRef<HTMLImageElement | null>(null);

  const startTimeRef = useRef<number>(0);
  const settingsRef = useRef(settings);

  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.timerMode === 'pomodoro' ? POMODORO_WORK : 0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load Avatar Image once
  useEffect(() => {
    const img = new Image();
    img.src = 'https://api.iconify.design/noto:smiling-face-with-sunglasses.svg';
    img.onload = () => { avatarImgRef.current = img; };
  }, []);

  // Initialize MediaPipe Face Detection Locally
  useEffect(() => {
    const setupFaceDetection = async () => {
      try {
        // Fix: Use any casting to avoid 'default' property error on faceDetectionModule
        const FaceDetectionClass = (faceDetectionModule as any).FaceDetection || ((faceDetectionModule as any).default ? (faceDetectionModule as any).default.FaceDetection : null);
        
        if (!FaceDetectionClass) {
          console.error("FaceDetection class not found in module", faceDetectionModule);
          return;
        }

        const faceDetection = new FaceDetectionClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`
        });

        faceDetection.setOptions({
          model: 'short',
          minDetectionConfidence: 0.5
        });

        faceDetection.onResults((results: any) => {
          if (results.detections && results.detections.length > 0) {
            lastFaceBoxRef.current = results.detections[0].boundingBox;
            lastDetectionTimeRef.current = Date.now();
          }
        });

        faceDetectorRef.current = faceDetection;
      } catch (err) {
        console.error("Failed to setup face detection", err);
      }
    };
    
    setupFaceDetection();
  }, []);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1920, height: 1080 }, 
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera access failed", err);
      }
    };
    initCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (isTimerActive) {
      interval = window.setInterval(() => {
        if (settings.timerMode === 'pomodoro') {
          setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        } else {
          setTimeLeft(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, settings.timerMode]);

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).filter((v, i) => v !== '00' || i > 0).join(':');
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const drawFaceMask = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const now = Date.now();
    const box = lastFaceBoxRef.current;
    
    // Fail-safe: Use last known position for 500ms if detection is lost
    if (!box || (now - lastDetectionTimeRef.current > 500)) return;

    // Expanded Mask Strategy (1.4x scaling for privacy buffer)
    const scaleFactor = 1.4;
    const w = box.width * canvasWidth * scaleFactor;
    const h = box.height * canvasHeight * scaleFactor;
    const x = (box.xCenter * canvasWidth) - (w / 2);
    const y = (box.yCenter * canvasHeight) - (h / 2);

    ctx.save();
    
    if (settings.faceSticker === FaceStickerType.BLUR) {
      ctx.beginPath();
      ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.filter = 'blur(40px)';
      ctx.drawImage(canvasRef.current!, 0, 0);
    } else if (settings.faceSticker === FaceStickerType.PIXELATE) {
      const pixelSize = 15;
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = w / pixelSize;
      smallCanvas.height = h / pixelSize;
      const smallCtx = smallCanvas.getContext('2d')!;
      smallCtx.imageSmoothingEnabled = false;
      smallCtx.drawImage(canvasRef.current!, x, y, w, h, 0, 0, smallCanvas.width, smallCanvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(smallCanvas, 0, 0, smallCanvas.width, smallCanvas.height, x, y, w, h);
    } else {
      // Default: Avatar
      if (avatarImgRef.current) {
        ctx.drawImage(avatarImgRef.current, x, y, w, h);
      } else {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  };

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) {
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Step 1: Inference (Local, Private)
    if (settings.faceProtection && faceDetectorRef.current) {
      try {
        await faceDetectorRef.current.send({ image: video });
      } catch (err) {
        console.error("Face detection inference error", err);
      }
    }

    // Step 2: Render base frame
    ctx.save();
    ctx.filter = settings.filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Step 3: Overlay Privacy Mask (if enabled)
    if (settings.faceProtection) {
      drawFaceMask(ctx, canvas.width, canvas.height);
    }

    // Timer Overlay
    const fs = 40 * settings.overlayScale;
    const weight = settings.timerFontWeight === '700' ? 'bold' : 'normal';
    ctx.font = `${weight} ${fs}px ${settings.font}`;
    const t = formatTime(timeLeft);
    const m = ctx.measureText(t);
    const p = settings.timerPadding * settings.overlayScale;
    const w = m.width + p * 2;
    const h = (fs + p * 1.5);
    
    let px = (settings.overlayX / 100) * canvas.width - (w / 2);
    let py = (settings.overlayY / 100) * canvas.height - (h / 2);
    px = Math.max(20, Math.min(canvas.width - w - 20, px));
    py = Math.max(20, Math.min(canvas.height - h - 20, py));

    ctx.fillStyle = hexToRgba(settings.timerBgColor, settings.timerOpacity);
    ctx.beginPath();
    const radius = settings.timerBorderRadius * settings.overlayScale;
    if (ctx.roundRect) {
      ctx.roundRect(px, py, w, h, [radius]);
    } else {
      ctx.rect(px, py, w, h);
    }
    ctx.fill();

    ctx.fillStyle = settings.timerTextColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(t, px + p, py + (h / 2));

    // Recording HUD
    if (isRecording) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(60, 60, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px "JetBrains Mono"';
      ctx.fillText(`REC ${formatTime(recordingTime)}`, 90, 60);
    }

    requestRef.current = requestAnimationFrame(draw);
  }, [settings, timeLeft, isRecording, recordingTime]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [draw]);

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      onRecordingStateChange(false);
    } else {
      if (!canvasRef.current) return;
      chunksRef.current = [];
      const stream = canvasRef.current.captureStream(30);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getAudioTracks().forEach(t => stream.addTrack(t));
      }
      
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
      startTimeRef.current = Date.now();
      
      rec.ondataavailable = e => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const finalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `StudyStream_${Date.now()}.webm`;
        a.click();
        
        onSessionComplete({
          id: crypto.randomUUID(),
          timestamp: startTimeRef.current,
          durationSeconds: finalDuration,
          label: settingsRef.current.sessionLabel,
          type: settingsRef.current.timerMode
        });
      };
      
      rec.start();
      mediaRecorderRef.current = rec;
      setIsRecording(true);
      setIsTimerActive(true);
      onRecordingStateChange(true);
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full h-full max-w-[1920px] aspect-video rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <video ref={videoRef} className="hidden" muted playsInline />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        
        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
              {settings.faceProtection && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
              <span className="text-white text-sm font-bold tracking-tight">
                {settings.sessionLabel} {settings.faceProtection ? '(Face Shield Active)' : ''}
              </span>
            </div>
          </div>

          <div className="flex justify-center items-center pointer-events-auto">
            <button 
              onClick={toggleRecording}
              className={`group flex items-center gap-4 px-10 py-5 rounded-full font-black text-xl tracking-tighter transition-all shadow-2xl ${
                isRecording 
                ? 'bg-red-500 hover:bg-red-600 scale-105 ring-8 ring-red-500/20' 
                : 'bg-white text-black hover:bg-slate-100 ring-8 ring-white/10'
              }`}
            >
              {isRecording ? <Icons.Stop /> : <Icons.Video />}
              {isRecording ? 'FINISH' : 'START SESSION'}
            </button>
          </div>
        </div>
      </div>
      
      {!isRecording && (
        <div className="mt-4 flex gap-8 items-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
           <button onClick={() => setIsTimerActive(!isTimerActive)} className="hover:text-emerald-400 transition-colors">
            {isTimerActive ? 'PAUSE TIMER' : 'RESUME TIMER'}
           </button>
           <button onClick={() => setTimeLeft(settings.timerMode === 'pomodoro' ? POMODORO_WORK : 0)} className="hover:text-blue-400 transition-colors">
            RESET TIMER
           </button>
           {settings.faceProtection && (
             <span className="text-emerald-500/50 flex items-center gap-1 border border-emerald-500/20 px-2 py-0.5 rounded-full">
               <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
               Local Face Detection Active
             </span>
           )}
        </div>
      )}
    </div>
  );
};

export default RecordingView;
