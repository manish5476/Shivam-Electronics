import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-product-analytics',
  standalone: true,
  imports: [CommonModule, TabViewModule, GalleriaModule, TagModule],
  templateUrl: './product-analytics.component.html',
  styleUrls: ['./product-analytics.component.css']
})
export class ProductAnalyticsComponent {
  @Input() data: any
  @Input() loading: boolean = false;

  // Helper function to format category names
  formatCategoryName(id: string): string {
    return id.split(',').pop()?.replace(/([A-Z])/g, ' $1').trim() || 'N/A';
  }
}
