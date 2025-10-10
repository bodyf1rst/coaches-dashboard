import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-rest-timer',
  templateUrl: './rest-timer.component.html',
  styleUrls: ['./rest-timer.component.scss']
})
export class RestTimerComponent implements OnDestroy {
  @Input() durationSeconds: number = 60;
  @Input() beepEnabled: boolean = true;
  @Input() autoStart: boolean = false;
  @Output() timerComplete = new EventEmitter<void>();
  @Output() timerSkipped = new EventEmitter<void>();

  countdown: number = 0;
  isRunning: boolean = false;
  isPaused: boolean = false;
  progress: number = 0;

  private intervalId: any;
  private audioContext: AudioContext | null = null;

  ngOnInit(): void {
    this.countdown = this.durationSeconds;
    if (this.autoStart) {
      this.start();
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;

    if (this.countdown === 0) {
      this.countdown = this.durationSeconds;
    }

    this.intervalId = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.updateProgress();
      } else {
        this.complete();
      }
    }, 1000);
  }

  pause(): void {
    if (!this.isRunning) return;

    this.isPaused = true;
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume(): void {
    if (!this.isPaused) return;
    this.start();
  }

  skip(): void {
    this.stop();
    this.timerSkipped.emit();
  }

  reset(): void {
    this.stop();
    this.countdown = this.durationSeconds;
    this.progress = 0;
  }

  private stop(): void {
    this.isRunning = false;
    this.isPaused = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private complete(): void {
    this.stop();

    if (this.beepEnabled) {
      this.playBeep();
    }

    this.timerComplete.emit();
  }

  private updateProgress(): void {
    this.progress = ((this.durationSeconds - this.countdown) / this.durationSeconds) * 100;
  }

  private playBeep(): void {
    try {
      // Create AudioContext if not exists
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Create oscillator for beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure beep sound (800Hz, 0.2s duration)
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getCircleProgress(): string {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (this.progress / 100) * circumference;
    return `${circumference} ${circumference}`;
  }

  getCircleOffset(): number {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    return circumference - (this.progress / 100) * circumference;
  }
}
