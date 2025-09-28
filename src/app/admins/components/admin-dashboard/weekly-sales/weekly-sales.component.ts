import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-weekly-sales',
  imports: [CommonModule],
  templateUrl: './weekly-sales.component.html',
  styleUrl: './weekly-sales.component.css'
})
export class WeeklySalesComponent {
  @Input() data: any
  @Input() loading: any
}
