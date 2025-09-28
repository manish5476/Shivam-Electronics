import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-monthly-sales',
  imports: [],
  templateUrl: './monthly-sales.component.html',
  styleUrl: './monthly-sales.component.css'
})
export class MonthlySalesComponent {
  @Input() data: any
  @Input() loading: any
}
