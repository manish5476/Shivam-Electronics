import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kpi-summary',
  imports: [CommonModule,FormsModule],
  templateUrl: './kpi-summary.component.html',
  styleUrl: './kpi-summary.component.css'
})
export class KpiSummaryComponent {
  @Input() data: any
    Math = Math; // ✅ makes Math usable in template

  @Input() loading: any
}
