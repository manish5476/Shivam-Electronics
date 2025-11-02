import {
  Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges,
  ChangeDetectorRef, inject, PLATFORM_ID, ViewChild, ElementRef
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ChartModule } from 'primeng/chart';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { BadgeModule } from 'primeng/badge';

// Services
import { AppMessageService } from '../../../../core/services/message.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ChartService, ChartOption } from '../../../../core/services/chart.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

type PrimeNgChartType = 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar';

interface DisplayChart {
  title: string;
  type: PrimeNgChartType;
  data: any;
  options: any;
  isLoading: boolean;
  error?: string;
}

@Component({
  selector: 'app-dashboard-chart-combo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ChartModule, MultiSelectModule, DropdownModule,
    ButtonModule, SkeletonModule, CardModule, DialogModule, CarouselModule, BadgeModule
  ],
  templateUrl: './dashboard-chart-combo.component.html',
  styleUrls: ['./dashboard-chart-combo.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate('0.5s ease', style({ opacity: 1 }))])
    ]),
    trigger('panelAnimation', [
      state('void', style({ opacity: 0, transform: 'scale(0.95)' })),
      transition('void => *', animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' })))
    ])
  ]
})
export class DashboardChartComboComponent implements OnInit, OnDestroy, OnChanges {

  /* --------------------------------------------------------------------- */
  /*  VIEWCHILD REFERENCES (fixed)                                         */
  /* --------------------------------------------------------------------- */
  @ViewChild('chartRef', { static: false }) chartRef!: ElementRef;          // per carousel item
  @ViewChild('dialogChartRef', { static: false }) dialogChartRef!: ElementRef; // dialog chart

  /* --------------------------------------------------------------------- */
  /*  STATE                                                                */
  /* --------------------------------------------------------------------- */
  displayCharts: DisplayChart[] = [];

  showDialog = false;
  selectedChartForDialog: DisplayChart | null = null;

  chartOptions$: Observable<ChartOption[]> | undefined;
  selectedCharts: string[] = ['revenueAndProfitTrend'];   // default

  @Input() selectedPeriod = 'last30days';
  @Input() startDate?: string;
  @Input() endDate?: string;

  private destroy$ = new Subject<void>();

  responsiveOptions = [
    { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1200px', numVisible: 3, numScroll: 1 },
    { breakpoint: '992px',  numVisible: 2, numScroll: 1 },
    { breakpoint: '768px',  numVisible: 1, numScroll: 1 }
  ];

  isFullscreen = false;

  /* --------------------------------------------------------------------- */
  /*  DI                                                                   */
  /* --------------------------------------------------------------------- */
  private platformId = inject(PLATFORM_ID);
  private chartService = inject(ChartService);
  private messageService = inject(AppMessageService);
  private themeService = inject(ThemeService);
  private cd = inject(ChangeDetectorRef);

  /* --------------------------------------------------------------------- */
  /*  LIFECYCLE                                                            */
  /* --------------------------------------------------------------------- */
  ngOnInit(): void {
    this.chartOptions$ = this.chartService.getChartOptions();
    this.fetchAllChartsData();

    this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.displayCharts.forEach(c => c.options = this.getCommonChartOptions());
      if (this.selectedChartForDialog?.data) {
        this.selectedChartForDialog.options = this.getCommonChartOptions(true);
      }
      this.cd.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPeriod'] || changes['startDate'] || changes['endDate']) {
      this.fetchAllChartsData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* --------------------------------------------------------------------- */
  /*  UI ACTIONS                                                          */
  /* --------------------------------------------------------------------- */
  onChartSelectionChange(): void {
    this.fetchAllChartsData();
  }

  openChartDialog(chart: DisplayChart): void {
    this.selectedChartForDialog = { ...chart, options: this.getCommonChartOptions(true) };
    this.showDialog = true;
    this.cd.markForCheck();
  }

  /* --------------------------------------------------------------------- */
  /*  DATA FETCH                                                          */
  /* --------------------------------------------------------------------- */
  fetchAllChartsData(): void {
    if (!this.selectedCharts.length) {
      this.displayCharts = [];
      this.cd.markForCheck();
      return;
    }

    this.displayCharts = this.selectedCharts.map(() => ({
      title: 'Loading...',
      type: 'bar' as PrimeNgChartType,
      data: null,
      options: null,
      isLoading: true
    }));

    const requests = this.selectedCharts.map(id =>
      this.chartService.getChartData(id, this.selectedPeriod, this.startDate, this.endDate).pipe(
        map(resp => ({ id, resp })),
        catchError(err => of({ id, error: err }))
      )
    );

    forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe(results => {
      results.forEach((r, i) => {
        if ('error' in r) {
          this.displayCharts[i] = {
            ...this.displayCharts[i],
            title: `Error – ${r.id}`,
            isLoading: false,
            error: 'Failed to fetch data'
          };
          this.messageService.showError('Error', `Failed to fetch ${r.id}`);
        } else {
          const api = r.resp;
          if (api?.data?.length) {
            this.displayCharts[i] = {
              title: api.title,
              type: this.getPrimeNgChartType(api.type),
              data: this.prepareChartData(api),
              options: this.getCommonChartOptions(),
              isLoading: false
            };
          } else {
            this.displayCharts[i] = {
              ...this.displayCharts[i],
              title: api.title ?? 'No Data',
              isLoading: false,
              error: 'No data available'
            };
            this.messageService.showWarn('No Data', `No data for ${r.id}`);
          }
        }
      });
      this.cd.markForCheck();
    });
  }

  /* --------------------------------------------------------------------- */
  /*  HELPERS                                                             */
  /* --------------------------------------------------------------------- */
  private prepareChartData(api: any): any {
    if (!isPlatformBrowser(this.platformId)) return null;

    const doc = getComputedStyle(document.documentElement);
    const accent = doc.getPropertyValue('--theme-accent-primary').trim();
    const warn  = doc.getPropertyValue('--theme-warning-primary').trim();
    const palette = [accent, warn, '#FFCE56', '#36A2EB', '#4BC0C0'];

    switch (api.type) {
      case 'line':
        return {
          labels: api.data.map((d: any) => d.date),
          datasets: [
            { label: 'Revenue', data: api.data.map((d: any) => d.revenue), borderColor: palette[0], fill: false, tension: 0.4 },
            { label: 'Profit',  data: api.data.map((d: any) => d.profit),  borderColor: palette[1], fill: false, tension: 0.4 }
          ]
        };

      case 'bar':
      case 'horizontalBar':
        return {
          labels: api.data.map((d: any) => d.brand ?? d.label ?? d.product ?? d.bucket ?? d.country ?? d.customer),
          datasets: [{ label: 'Value', data: api.data.map((d: any) => d.value ?? d.revenue ?? d.count), backgroundColor: palette[0] }]
        };

      case 'pie':
      case 'donut':
      case 'doughnut':
        return {
          labels: api.data.map((d: any) => d.label ?? d.category ?? d.channel ?? d.country),
          datasets: [{ data: api.data.map((d: any) => d.value ?? d.stock ?? d.count), backgroundColor: palette }]
        };

      case 'stackedBar':
        const dates = [...new Set(api.data.map((d: any) => d.date))];
        const newC   = api.data.filter((d: any) => d.customerType === 'New').map((d: any) => d.revenue);
        const retC   = api.data.filter((d: any) => d.customerType === 'Returning').map((d: any) => d.revenue);
        return {
          labels: dates,
          datasets: [
            { label: 'New',       data: newC, backgroundColor: palette[0] },
            { label: 'Returning', data: retC, backgroundColor: palette[1] }
          ]
        };

      default:
        return { labels: [], datasets: [] };
    }
  }

  private getPrimeNgChartType(t: string): PrimeNgChartType {
    const map: Record<string, PrimeNgChartType> = {
      line: 'line', bar: 'bar', horizontalBar: 'bar',
      pie: 'pie', donut: 'doughnut', doughnut: 'doughnut',
      stackedBar: 'bar'
    };
    return map[t] ?? 'bar';
  }

  private getCommonChartOptions(isDialog = false): any {
    const doc = getComputedStyle(document.documentElement);
    const txt = doc.getPropertyValue('--text-color');
    const txt2 = doc.getPropertyValue('--text-color-secondary');
    const border = doc.getPropertyValue('--surface-border');

    return {
      maintainAspectRatio: false,
      aspectRatio: isDialog ? 1.2 : 0.7,
      responsive: true,
      plugins: { legend: { labels: { color: txt } } },
      scales: {
        x: { ticks: { color: txt2 }, grid: { color: border } },
        y: { ticks: { color: txt2 }, grid: { color: border } }
      },
      interaction: { intersect: false, mode: 'index' }
    };
  }


  /* --------------------------------------------------------------------- */
  /*  EXPORT (working PNG)                                                */
  /* --------------------------------------------------------------------- */
  exportChart(chart: DisplayChart, chartRef: any): void {
    if (!chartRef?.chart?.canvas) {
      this.messageService.showWarn('Export', 'Chart not ready.');
      return;
    }
    try {
      const a = document.createElement('a');
      a.download = `${chart.title.replace(/[^a-z0-9]/gi, '_')}.png`;
      a.href = chartRef.chart.canvas.toDataURL('image/png');
      a.click();
      this.messageService.showSuccess('Export', `Downloaded ${chart.title}`);
    } catch {
      this.messageService.showError('Export', 'Failed to download.');
    }
  }

  /* --------------------------------------------------------------------- */
  /*  FULLSCREEN                                                          */
  /* --------------------------------------------------------------------- */
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    document.body.classList.toggle('fullscreen-chart', this.isFullscreen);
    this.cd.markForCheck();
  }

  /* --------------------------------------------------------------------- */
  /*  PERF                                                                */
  /* --------------------------------------------------------------------- */
  trackByChart(_: number, c: DisplayChart): string {
    return c.title;
  }
}
