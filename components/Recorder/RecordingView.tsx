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
        // Fix: Use type casting to bypass TS error on 'default' property which may not be in the module's type definition
        const mod = faceDetectionModule as any;
        const FaceDetectionClass = mod.FaceDetection || (mod.default ? mod.default.FaceDetection : null);
        
        if (!FaceDetectionClass) return;

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
    if (!box || (now - lastDetectionTimeRef.current > 500)) return;

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
      if (avatarImgRef.current) ctx.drawImage(avatarImgRef.current, x, y, w, h);
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

    if (settings.faceProtection && faceDetectorRef.current) {
      try { await faceDetectorRef.current.send({ image: video }); } catch (err) {}
    }

    ctx.save();
    ctx.filter = settings.filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (settings.faceProtection) drawFaceMask(ctx, canvas.width, canvas.height);

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
    if (ctx.roundRect) ctx.roundRect(px, py, w, h, [radius]); else ctx.rect(px, py, w, h);
    ctx.fill();

    ctx.fillStyle = settings.timerTextColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(t, px + p, py + (h / 2));

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
    <div className="w-full h-full bg-black flex flex-col p-2 md:p-4 overflow-hidden box-border">
      {/* Container that strictly fits available space */}
      <div className="flex-1 min-h-0 relative w-full flex items-center justify-center">
        <div className="relative w-full h-full max-w-[1920px] rounded-xl md:rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex items-center justify-center">
          <video ref={videoRef} className="hidden" muted playsInline />
          {/* object-contain ensures the aspect ratio is maintained inside the fixed height container */}
          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
          
          <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-start opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                {settings.faceProtection && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
                <span className="text-white text-xs font-bold tracking-tight">
                  {settings.sessionLabel}
                </span>
              </div>
            </div>

            <div className="flex justify-center items-center pointer-events-auto">
              <button 
                onClick={toggleRecording}
                className={`group flex items-center gap-3 px-8 py-3 md:py-4 rounded-full font-black text-sm md:text-lg transition-all shadow-2xl ${
                  isRecording 
                  ? 'bg-red-500 hover:bg-red-600 scale-105 ring-4 ring-red-500/20' 
                  : 'bg-white text-black hover:bg-slate-100 ring-4 ring-white/10'
                }`}
              >
                {isRecording ? <Icons.Stop /> : <Icons.Video />}
                {isRecording ? 'FINISH' : 'START SESSION'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls Area (Shrink-resistant) */}
      {!isRecording && (
        <div className="mt-2 md:mt-3 flex flex-wrap gap-4 md:gap-6 items-center justify-center text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest shrink-0">
           <button onClick={() => setIsTimerActive(!isTimerActive)} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 py-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isTimerActive ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
            {isTimerActive ? 'PAUSE TIMER' : 'RESUME TIMER'}
           </button>
           <button onClick={() => setTimeLeft(settings.timerMode === 'pomodoro' ? POMODORO_WORK : 0)} className="hover:text-blue-400 transition-colors py-1">
            RESET TIMER
           </button>
           {settings.faceProtection && (
             <span className="text-emerald-500/60 hidden sm:flex items-center gap-1.5 border border-emerald-500/20 px-3 py-1 rounded-full bg-emerald-500/5">
               <Icons.Drive />
               Local Face Shield
             </span>
           )}
        </div>
      )}
    </div>
  );
};

export default RecordingView;