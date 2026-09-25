// High-performance, zero-dependency browser optical flow & motion gesture detector for Sophia AI
// Detects real-time hand-waving gestures via user webcam using canvas frame differencing

export type GestureSensitivity = 'low' | 'medium' | 'high';

export interface GestureMetrics {
  motionEnergy: number; // 0 to 1
  handDetected: boolean;
  centroidX: number; // 0 (left) to 1 (right)
  centroidY: number; // 0 (top) to 1 (bottom)
  isWaving: boolean;
  waveConfidence: number; // 0 to 100
  fps: number;
  lastGestureTime: number;
}

export interface WaveEvent {
  timestamp: number;
  confidence: number;
  direction: 'left' | 'right' | 'bidirectional';
}

interface CentroidSample {
  time: number;
  x: number;
  energy: number;
}

export class WebcamGestureDetector {
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prevFrameData: Uint8Array | null = null;
  private animationId: number | null = null;
  private isRunning = false;
  private sensitivity: GestureSensitivity = 'medium';

  // Processing resolution: 80x60 for ultra-low CPU (<2%) and high responsiveness (30-60 FPS)
  private readonly procWidth = 80;
  private readonly procHeight = 60;

  // History buffer for wave trajectory analysis
  private samples: CentroidSample[] = [];
  private lastWaveTimestamp = 0;
  private cooldownMs = 1400; // Delay before next wave can trigger to avoid trailing hand bounces

  // FPS calculation
  private lastFrameTimestamp = 0;
  private frameCount = 0;
  private currentFps = 0;
  private fpsTimer = 0;

  // Listeners
  public onWave?: (event: WaveEvent) => void;
  public onMetrics?: (metrics: GestureMetrics) => void;
  public onError?: (error: string) => void;
  public onCameraStateChange?: (active: boolean) => void;

  constructor(sensitivity: GestureSensitivity = 'medium') {
    this.sensitivity = sensitivity;
  }

  public setSensitivity(level: GestureSensitivity) {
    this.sensitivity = level;
  }

  public getSensitivity(): GestureSensitivity {
    return this.sensitivity;
  }

  public isActive(): boolean {
    return this.isRunning && !!this.stream?.active;
  }

  public getVideoElement(): HTMLVideoElement | null {
    return this.video;
  }

  // Start webcam video capture and optical motion analysis
  public async start(): Promise<boolean> {
    if (this.isRunning) return true;
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const msg = 'Webcam mediaDevices API not supported in this browser.';
      console.warn(msg);
      this.onError?.(msg);
      return false;
    }

    try {
      // Create hidden video element for decoding stream
      if (!this.video) {
        this.video = document.createElement('video');
        this.video.setAttribute('playsinline', 'true');
        this.video.setAttribute('muted', 'true');
        this.video.muted = true;
      }

      // Create offscreen canvas for downsampled optical difference math
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.procWidth;
        this.canvas.height = this.procHeight;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.stream = stream;
      this.video.srcObject = stream;
      await this.video.play();

      this.isRunning = true;
      this.prevFrameData = null;
      this.samples = [];
      this.lastFrameTimestamp = performance.now();
      this.fpsTimer = performance.now();
      this.frameCount = 0;

      this.onCameraStateChange?.(true);

      // Start processing loop
      this.processLoop();
      return true;
    } catch (err: any) {
      console.warn('Could not initialize webcam for gesture control:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const errMsg = isDenied
        ? 'Camera permission denied. Enable camera access in browser to use futuristic wave gestures.'
        : `Camera error: ${err.message || 'Unable to open webcam'}`;
      this.onError?.(errMsg);
      this.stop();
      return false;
    }
  }

  // Stop webcam capture and release all camera hardware
  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.stream) {
      try {
        this.stream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.stream = null;
    }

    if (this.video) {
      try {
        this.video.pause();
        this.video.srcObject = null;
      } catch {}
    }

    this.isRunning = false;
    this.prevFrameData = null;
    this.samples = [];
    this.onCameraStateChange?.(false);
  }

  // Simulate a wave gesture for instant testing without webcam
  public simulateWave(): void {
    const now = Date.now();
    this.lastWaveTimestamp = now;
    this.onWave?.({
      timestamp: now,
      confidence: 96,
      direction: 'bidirectional',
    });
  }

  // Core frame-differencing optical flow processing loop
  private processLoop = () => {
    if (!this.isRunning || !this.video || !this.ctx || !this.canvas) return;

    const now = performance.now();

    // Calculate FPS
    this.frameCount++;
    if (now - this.fpsTimer >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.fpsTimer));
      this.frameCount = 0;
      this.fpsTimer = now;
    }

    // Ensure video has received visual data
    if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.analyzeCurrentFrame(now);
    }

    this.animationId = requestAnimationFrame(this.processLoop);
  };

  private analyzeCurrentFrame(now: number) {
    if (!this.ctx || !this.canvas || !this.video) return;

    const w = this.procWidth;
    const h = this.procHeight;
    const totalPixels = w * h;

    // Draw video frame downscaled to 80x60
    this.ctx.drawImage(this.video, 0, 0, w, h);
    const imgData = this.ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Allocate grayscale buffer
    const currentGray = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      // Luminance = 0.299*R + 0.587*G + 0.114*B
      currentGray[i] = Math.round(data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
    }

    if (!this.prevFrameData) {
      this.prevFrameData = currentGray;
      return;
    }

    // Sensitivity threshold parameters
    let diffThreshold = 22; // Luminance change threshold
    let minEnergy = 0.045; // Minimum fraction of frame in motion
    let minSpan = 0.22; // Minimum horizontal span of wave
    let requiredReversals = 2; // At least left->right->left (2 reversals)

    if (this.sensitivity === 'high') {
      diffThreshold = 18;
      minEnergy = 0.03;
      minSpan = 0.16;
      requiredReversals = 2;
    } else if (this.sensitivity === 'low') {
      diffThreshold = 26;
      minEnergy = 0.07;
      minSpan = 0.28;
      requiredReversals = 2;
    }

    let motionCount = 0;
    let sumX = 0;
    let sumY = 0;

    // Pixel differencing & motion centroid calculation
    for (let y = 0; y < h; y++) {
      const rowOffset = y * w;
      for (let x = 0; x < w; x++) {
        const i = rowOffset + x;
        const diff = Math.abs(currentGray[i] - this.prevFrameData[i]);
        if (diff > diffThreshold) {
          motionCount++;
          sumX += x;
          sumY += y;
        }
      }
    }

    // Save current frame as previous for next iteration
    this.prevFrameData = currentGray;

    const motionEnergy = motionCount / totalPixels;
    const handDetected = motionEnergy >= minEnergy && motionEnergy < 0.75; // Exclude camera shake / global light switches

    let centroidX = 0.5;
    let centroidY = 0.5;

    if (motionCount > 0) {
      centroidX = sumX / motionCount / w;
      centroidY = sumY / motionCount / h;
    }

    // Add to motion history if motion is detected
    if (handDetected) {
      this.samples.push({ time: now, x: centroidX, energy: motionEnergy });
    }

    // Prune samples older than 1.3 seconds
    const cutoff = now - 1300;
    this.samples = this.samples.filter((s) => s.time >= cutoff);

    // Wave pattern recognition
    let waveDetected = false;
    let confidence = 0;
    let waveDirection: 'left' | 'right' | 'bidirectional' = 'bidirectional';

    const timeSinceLastWave = now - this.lastWaveTimestamp;
    const isInCooldown = timeSinceLastWave < this.cooldownMs;

    if (!isInCooldown && this.samples.length >= 6) {
      // Analyze horizontal trajectory oscillation
      const xs = this.samples.map((s) => s.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const span = maxX - minX;

      if (span >= minSpan) {
        // Count direction transitions (sign reversals of velocity dx)
        let reversals = 0;
        let lastDirection = 0; // -1 = left, +1 = right
        let prevX = this.samples[0].x;

        for (let i = 1; i < this.samples.length; i++) {
          const dx = this.samples[i].x - prevX;
          const dt = this.samples[i].time - this.samples[i - 1].time;
          if (dt > 0 && Math.abs(dx) > 0.025) {
            const currentDir = dx > 0 ? 1 : -1;
            if (lastDirection !== 0 && currentDir !== lastDirection) {
              reversals++;
            }
            lastDirection = currentDir;
            prevX = this.samples[i].x;
          }
        }

        if (reversals >= requiredReversals) {
          waveDetected = true;
          confidence = Math.min(99, Math.round(75 + reversals * 8 + span * 40));
          this.lastWaveTimestamp = now;
          this.samples = []; // Reset trajectory after triggering

          this.onWave?.({
            timestamp: Date.now(),
            confidence,
            direction: waveDirection,
          });
        }
      }
    }

    // Emit live telemetry for futuristic HUD rendering
    this.onMetrics?.({
      motionEnergy: Math.min(1, motionEnergy * 4), // Boosted for UI visualization
      handDetected,
      centroidX,
      centroidY,
      isWaving: waveDetected || isInCooldown,
      waveConfidence: confidence,
      fps: this.currentFps,
      lastGestureTime: this.lastWaveTimestamp,
    });
  }
}
