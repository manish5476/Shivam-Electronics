import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-overview',
  imports: [],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.css'
})
export class DashboardOverviewComponent {
  @Input() data: any
  @Input() loading: any
}
