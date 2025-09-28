import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inventory-turnover',
  imports: [],
  templateUrl: './inventory-turnover.component.html',
  styleUrl: './inventory-turnover.component.css'
})
export class InventoryTurnoverComponent {
  @Input() data: any
  @Input() loading: any
}
