import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css'],
})
export class LoadingComponent implements OnDestroy {
    isLoading$: Observable<boolean>;
    private _canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private animationFrameId: number = 0;

    // Animation variables
    private earthRadius = 0;
    private rotationAngle = 0;
    private locations = [
        { lat: 34.0522, lon: -118.2437 }, // Los Angeles
        { lat: 51.5074, lon: -0.1278 }, // London
        { lat: 35.6895, lon: 139.6917 }, // Tokyo
        { lat: 28.6139, lon: 77.2090 }, // New Delhi
        { lat: -33.8688, lon: 151.2093 } // Sydney
    ];
    private connections: any[] = [];
    private stars: any[] = [];
    private backgroundStars: any[] = []; // Array for background stars
    private frameCount = 0;

    @ViewChild('earthCanvas')
    set canvasRef(ref: ElementRef<HTMLCanvasElement>) {
        if (ref && isPlatformBrowser(this.platformId)) {
            this._canvasRef = ref;
            const canvas = this._canvasRef.nativeElement;
            this.ctx = canvas.getContext('2d')!;
            this.resizeCanvas();
            this.generateBackgroundStars(); // Generate static stars on init
            window.addEventListener('resize', this.resizeCanvas.bind(this));
            this.animate();
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
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            window.removeEventListener('resize', this.resizeCanvas.bind(this));
        }
    }

    private resizeCanvas(): void {
        if (this._canvasRef) {
            const canvas = this._canvasRef.nativeElement;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            this.earthRadius = Math.min(canvas.width, canvas.height) * 0.2;
        }
    }


    private generateBackgroundStars(): void {
        const canvas = this._canvasRef.nativeElement;
        const numStars = 200;
        const radius = Math.min(canvas.width, canvas.height) / 2;

        for (let i = 0; i < numStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * radius; // spread stars evenly in circle
            const x = canvas.width / 2 + r * Math.cos(angle);
            const y = canvas.height / 2 + r * Math.sin(angle);

            this.backgroundStars.push({
                x,
                y,
                radius: Math.random() * 1.5,
            });
        }
    }
    // Generate static background stars once
    // private generateBackgroundStars(): void {
    //     const canvas = this._canvasRef.nativeElement;
    //     const numStars = 150;
    //     for (let i = 0; i < numStars; i++) {
    //         this.backgroundStars.push({
    //             x: Math.random() * canvas.width,
    //             y: Math.random() * canvas.height,
    //             radius: Math.random() * 1.5,
    //         });
    //     }
    // }

    private animate(): void {
        if (!isPlatformBrowser(this.platformId) || !this.ctx) return;

        this.animationFrameId = requestAnimationFrame(() => this.animate());
        this.frameCount++;

        const canvas = this._canvasRef.nativeElement;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 5;

        // Clip drawing inside circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        ctx.clip();

        // Draw cosmic gradient background
        const gradient = ctx.createRadialGradient(centerX, centerY, maxRadius * 0.2, centerX, centerY, maxRadius);
        gradient.addColorStop(0, "#000814");
        gradient.addColorStop(0.7, "#001d3d");
        gradient.addColorStop(1, "#000000");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars, earth, connections
        this.drawBackgroundStars();
        this.drawEarth(centerX, centerY);
        this.updateConnections();
        this.drawConnections(centerX, centerY);
        this.updateStars();
        this.drawStars();

        ctx.restore(); // Restore after clipping

        this.rotationAngle += 0.005;
    }

 

    private drawBackgroundStars(): void {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.backgroundStars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    private drawEarth(centerX: number, centerY: number): void {
        // Main Earth
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.earthRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#011F4B';
        this.ctx.fill();
        this.ctx.strokeStyle = '#00FDCF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Animated aura glow
        const glowGradient = this.ctx.createRadialGradient(centerX, centerY, this.earthRadius, centerX, centerY, this.earthRadius * 2);
        glowGradient.addColorStop(0, "rgba(0, 253, 207, 0.4)");
        glowGradient.addColorStop(1, "rgba(0, 253, 207, 0)");

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.earthRadius * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = glowGradient;
        this.ctx.fill();

        // City lights
        this.ctx.fillStyle = '#00FDCF';
        this.locations.forEach(loc => {
            const pos = this.toCartesian(loc.lat, loc.lon, centerX, centerY);
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // private drawEarth(centerX: number, centerY: number): void {
    //     this.ctx.beginPath();
    //     this.ctx.arc(centerX, centerY, this.earthRadius, 0, Math.PI * 2);
    //     this.ctx.fillStyle = '#011F4B';
    //     this.ctx.fill();
    //     this.ctx.strokeStyle = '#00FDCF';
    //     this.ctx.lineWidth = 2;
    //     this.ctx.stroke();

    //     const glowRadius = this.earthRadius * 1.05 + Math.sin(this.frameCount * 0.05) * 5;
    //     this.ctx.beginPath();
    //     this.ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    //     this.ctx.strokeStyle = `rgba(0, 253, 207, ${0.4 + Math.sin(this.frameCount * 0.05) * 0.2})`;
    //     this.ctx.lineWidth = 10;
    //     this.ctx.stroke();

    //     this.ctx.fillStyle = '#00FDCF';
    //     this.locations.forEach(loc => {
    //         const pos = this.toCartesian(loc.lat, loc.lon, centerX, centerY);
    //         this.ctx.beginPath();
    //         this.ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
    //         this.ctx.fill();
    //     });
    // }

    private updateConnections(): void {
        if (this.frameCount % 90 === 0) {
            const randomIndex1 = Math.floor(Math.random() * this.locations.length);
            let randomIndex2 = Math.floor(Math.random() * this.locations.length);
            while (randomIndex2 === randomIndex1) {
                randomIndex2 = Math.floor(Math.random() * this.locations.length);
            }
            this.connections.push({
                start: this.locations[randomIndex1],
                end: this.locations[randomIndex2],
                progress: 0
            });
        }

        this.connections.forEach(conn => {
            conn.progress += 0.02;
        });

        this.connections = this.connections.filter(conn => conn.progress <= 1);
    }

    private drawConnections(centerX: number, centerY: number): void {
        this.connections.forEach(conn => {
            const { start, end, progress } = conn;

            const startPos = this.toCartesian(start.lat, start.lon, centerX, centerY);
            const endPos = this.toCartesian(end.lat, end.lon, centerX, centerY);

            const pulseSize = Math.sin(progress * Math.PI) * 8 + 3;
            this.ctx.beginPath();
            this.ctx.arc(startPos.x, startPos.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = '#FD1D1D';
            this.ctx.fill();

            const currentX = startPos.x + (endPos.x - startPos.x) * progress;
            const currentY = startPos.y + (endPos.y - startPos.y) * progress;

            this.ctx.beginPath();
            this.ctx.moveTo(startPos.x, startPos.y);
            this.ctx.lineTo(currentX, currentY);
            this.ctx.strokeStyle = `rgba(0, 253, 207, ${1 - progress})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            if (progress >= 0.5) {
                this.ctx.beginPath();
                this.ctx.arc(currentX, currentY, pulseSize * 0.5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#FD1D1D';
                this.ctx.fill();
            }
        });
    }

    private updateStars(): void {
        if (this.frameCount % 120 === 0) {
            const randomIndex = Math.floor(Math.random() * this.locations.length);
            const startLoc = this.locations[randomIndex];
            const startPos = this.toCartesian(startLoc.lat, startLoc.lon, this._canvasRef.nativeElement.width / 2, this._canvasRef.nativeElement.height / 2);
            this.stars.push({
                x: startPos.x,
                y: startPos.y,
                radius: 2,
                opacity: 1,
                speed: Math.random() * 0.5 + 0.5
            });
        }

        this.stars.forEach(star => {
            const directionX = star.x - this._canvasRef.nativeElement.width / 2;
            const directionY = star.y - this._canvasRef.nativeElement.height / 2;
            const distance = Math.sqrt(directionX * directionX + directionY * directionY);

            star.x += (directionX / distance) * star.speed;
            star.y += (directionY / distance) * star.speed;

            star.radius += 0.1;
            star.opacity -= 0.01;
        });

        this.stars = this.stars.filter(star => star.radius < 20 && star.opacity > 0);
    }

    private drawStars(): void {
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.fill();
        });
    }

    private toCartesian(lat: number, lon: number, centerX: number, centerY: number): { x: number, y: number } {
        const rotatedLon = lon + (this.rotationAngle * 180 / Math.PI);
        const x = centerX + this.earthRadius * Math.cos(lat * Math.PI / 180) * Math.cos(rotatedLon * Math.PI / 180);
        const y = centerY + this.earthRadius * Math.sin(lat * Math.PI / 180);
        return { x, y };
    }
}