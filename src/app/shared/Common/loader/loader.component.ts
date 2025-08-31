import {
  Component,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isLoading$ | async"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <canvas #earthCanvas class="w-64 h-64"></canvas>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class LoadingComponent implements OnDestroy {
  isLoading$: Observable<boolean>;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId = 0;
  private rotation = 0;
  private earthRadius = 0;
  private stars: { x: number; y: number; r: number }[] = [];

  @ViewChild('earthCanvas')
  set canvasRef(ref: ElementRef<HTMLCanvasElement>) {
    if (ref && isPlatformBrowser(this.platformId)) {
      const canvas = ref.nativeElement;
      this.ctx = canvas.getContext('2d')!;
      this.resizeCanvas(canvas);
      this.generateStars(canvas);
      window.addEventListener('resize', () => this.resizeCanvas(canvas));
      this.animate(canvas);
    }
  }

  constructor(
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isLoading$ = this.loadingService.isLoading$;
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animationFrameId);
      window.removeEventListener('resize', () => {});
    }
  }

  private resizeCanvas(canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.earthRadius = Math.min(canvas.width, canvas.height) * 0.3;
  }

  private generateStars(canvas: HTMLCanvasElement) {
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5,
      });
    }
  }

  private animate(canvas: HTMLCanvasElement) {
    this.animationFrameId = requestAnimationFrame(() => this.animate(canvas));

    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'white';
    this.stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Earth Glow
    const glow = ctx.createRadialGradient(
      cx,
      cy,
      this.earthRadius * 0.8,
      cx,
      cy,
      this.earthRadius * 1.5
    );
    glow.addColorStop(0, 'rgba(0, 200, 255, 0.3)');
    glow.addColorStop(1, 'rgba(0, 200, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, this.earthRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Earth Body
    ctx.beginPath();
    ctx.arc(cx, cy, this.earthRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#003366';
    ctx.fill();

    // Rotating highlight (like continents)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.fillStyle = 'rgba(0,255,200,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.earthRadius * 0.6, this.earthRadius * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.rotation += 0.01;
  }
}
