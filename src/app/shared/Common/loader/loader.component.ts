import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';

// Define the Ripple class directly within the component or in a separate file if preferred
class Ripple {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
    speed: number;
    color: { r: number; g: number; b: number; };

    constructor(x: number, y: number, maxRadius: number, speed: number, color: { r: number; g: number; b: number; }) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.alpha = 1;
        this.speed = speed;
        this.color = color;
    }

    update() {
        this.radius += this.speed;
        this.alpha = 1 - (this.radius / this.maxRadius);
        if (this.alpha < 0) this.alpha = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css'],
})
export class LoadingComponent implements AfterViewInit, OnDestroy {
    isLoading$: Observable<boolean>;

    // Get a reference to the canvas element in the template
    @ViewChild('rippleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private ripples: Ripple[] = [];
    private frameCount: number = 0;
    private animationFrameId: number = 0; // To store the requestAnimationFrame ID for cleanup

    // Inject PLATFORM_ID to determine the execution environment
    constructor(
        private loadingService: LoadingService,
        @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
    ) {
        this.isLoading$ = this.loadingService.isLoading$;
    }

    ngAfterViewInit(): void {
        // Only run this code if in a browser environment
        if (isPlatformBrowser(this.platformId) && this.canvasRef && this.canvasRef.nativeElement) {
            const canvas = this.canvasRef.nativeElement;
            this.ctx = canvas.getContext('2d')!; // Get the 2D rendering context

            // Initial resize and add resize listener
            this.resizeCanvas();
            window.addEventListener('resize', this.resizeCanvas.bind(this));

            // Start the animation loop
            this.animate();
        }
    }

    ngOnDestroy(): void {
        // Only run this code if in a browser environment
        if (isPlatformBrowser(this.platformId)) {
            // Clean up: cancel the animation frame and remove the resize listener
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            window.removeEventListener('resize', this.resizeCanvas.bind(this));
        }
    }

    private resizeCanvas(): void {
        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    private drawStars(): void {
        const canvas = this.canvasRef.nativeElement;
        const ctx = this.ctx;
        const numStars = 150;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        for (let i = 0; i < numStars; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 1.5;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    private animate(): void {
        // Ensure animation only runs in browser
        if (isPlatformBrowser(this.platformId)) {
            this.animationFrameId = requestAnimationFrame(() => this.animate()); // Request next frame
        } else {
            return; // Stop animation if not in browser
        }

        const canvas = this.canvasRef.nativeElement;
        const ctx = this.ctx;

        // Clear the canvas for the new frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw a subtle dark background to enhance the universe feel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.drawStars(); // Draw the starry background

        // Add a new ripple periodically from the center of the canvas
        if (this.frameCount % 60 === 0) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const maxR = Math.min(canvas.width, canvas.height) * 0.45;
            const speed = Math.min(canvas.width, canvas.height) * 0.005;

            const colors = [
                { r: 0, g: 253, b: 207 },
                { r: 253, g: 29, b: 29 },
                { r: 252, g: 188, b: 69 },
                { r: 100, g: 149, b: 237 },
                { r: 147, g: 112, b: 219 },
                { r: 255, g: 255, b: 255 }
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            this.ripples.push(new Ripple(centerX, centerY, maxR, speed, randomColor));
        }

        // Update and draw all active ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            this.ripples[i].update();
            this.ripples[i].draw(ctx);
            if (this.ripples[i].alpha <= 0) {
                this.ripples.splice(i, 1);
            }
        }

        this.frameCount++;
    }
}
