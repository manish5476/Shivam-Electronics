import { ChangeDetectionStrategy, Component, computed, signal, OnInit, inject, Injectable } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { finalize, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification.service';
import { Dialog } from "primeng/dialog";
import { NotesManagerComponent } from '../../../../shared/Common/notes-manager/notes-manager.component';
// --- INTERFACES to strongly type the data ---
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog'; // Best practice to import the module
import { TabsModule } from 'primeng/tabs';
interface HeatmapDay {
  day: number;
  totalRevenue: number;
  salesCount: number;
  level: number;
}

interface DailySummary {
  date: string;
  revenue: number;
  salesCount: number;
  newCustomers: { _id: string; profileImg: string; fullname: string; mobileNumber: string; }[];
  newProducts: { _id: string; title: string; thumbnail: string; stock: number; }[];
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  heatmapData?: HeatmapDay;
}


@Component({
  selector: 'app-notification-calendar',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TabsModule,NotesManagerComponent, Dialog, ProgressSpinnerModule, TabViewModule, BadgeModule,
    DialogModule],
  templateUrl: './notification-calendar.component.html',
  styleUrls: ['./notification-calendar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Provide the mock service at the component level
  providers: [NotificationService]
})
export class NotificationCalendarComponent implements OnInit {
  // Injecting the NotificationService
  private notificationService = inject(NotificationService);

  // --- STATE MANAGEMENT WITH SIGNALS ---
  currentDate = signal(new Date());
  heatmapData = signal<HeatmapDay[]>([]);
  selectedDay = signal<CalendarDay | null>(null);
  selectedDaySummary = signal<any | null>(null);
  isLoadingHeatmap = signal(false);
  isLoadingSummary = signal(false);
  showSummaryDialog: boolean = false
  // --- COMPUTED SIGNALS ---
  displayedMonth = computed(() => {
    return this.currentDate().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  calendarGrid = computed<any>(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const heatmap = this.heatmapData();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();

    for (let i = startDayOfWeek; i > 0; i--) {
      const prevMonthDate = new Date(year, month, 1 - i);
      days.push({ date: prevMonthDate, dayOfMonth: prevMonthDate.getDate(), isCurrentMonth: false, isToday: false });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday: currentDate.getTime() === today.getTime(),
        heatmapData: heatmap.find(d => d.day === i)
      });
    }

    // Add days from the next month to fill the last week
    const endDayOfWeek = lastDayOfMonth.getDay();
    if (endDayOfWeek < 6) {
      for (let i = 1; i < 7 - endDayOfWeek; i++) {
        const nextMonthDate = new Date(year, month + 1, i);
        days.push({ date: nextMonthDate, dayOfMonth: nextMonthDate.getDate(), isCurrentMonth: false, isToday: false });
      }
    }
    return days;
  });

  readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calanderDay: any;
  showNotesDialog: boolean = false;

  ngOnInit() {
    this.fetchHeatmapData();
  }

  // --- DATA FETCHING METHODS ---
  fetchHeatmapData(): void {
    this.isLoadingHeatmap.set(true);
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth() + 1;

    this.notificationService.getCalendarHeatmap(year, month).pipe(
      finalize(() => this.isLoadingHeatmap.set(false))
    ).subscribe({
      next: (res) => this.heatmapData.set(res.data || []),
      error: () => this.heatmapData.set([]) // Clear data on error
    });
  }

  fetchDailySummary(date: Date): void {
    this.isLoadingSummary.set(true);
    this.selectedDaySummary.set(null);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    this.notificationService.getDailySummary(dateStr).pipe(
      finalize(() => this.isLoadingSummary.set(false))
    ).subscribe({
      next: (res) => this.selectedDaySummary.set(res.data),
      error: () => this.selectedDaySummary.set(null) // Clear data on error
    });
  }

  // --- EVENT HANDLERS ---
  changeMonth(monthOffset: number): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + monthOffset);
    this.currentDate.set(newDate);
    this.selectedDay.set(null);
    this.selectedDaySummary.set(null);
    this.fetchHeatmapData();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.selectedDay.set(null);
    this.selectedDaySummary.set(null);
    this.fetchHeatmapData();
  }

  selectDay(day: CalendarDay): void {
    this.showSummaryDialog = true
    if (!day.isCurrentMonth || !day.heatmapData) return;
    this.selectedDay.set(day);
    this.fetchDailySummary(day.date);
  }

  // --- UTILITY METHODS ---
  isDaySelected(day: CalendarDay): boolean {
    const selected = this.selectedDay();
    return selected ? selected.date.getTime() === day.date.getTime() : false;
  }

  formatDateForSummary(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }




  addNoteForDay(day: CalendarDay, event: Event): void {
    event.stopPropagation(); // prevent triggering selectDay
    this.showNotesDialog = true
    this.calanderDay = day
    console.log('Add note for', day.date);
  }

  viewNotesForDay(day: CalendarDay, event: Event): void {
    event.stopPropagation(); // prevent triggering selectDay
    console.log('View notes for', day.date);
    // 🔜 Later: fetch & display notes (modal / sidebar)
  }

}