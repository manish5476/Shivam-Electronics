import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-yearly-sales',
  imports: [CommonModule],
  templateUrl: './yearly-sales.component.html',
  styleUrl: './yearly-sales.component.css'
})
export class YearlySalesComponent {
  @Input() data: any
  @Input() loading: any
}
