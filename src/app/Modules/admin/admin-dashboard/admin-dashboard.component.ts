// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-admin-dashboard',
//   imports: [],
//   templateUrl: './admin-dashboard.component.html',
//   styleUrl: './admin-dashboard.component.css'
// })
// export class AdminDashboardComponent {

// }

import { Component, Type } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToolbarComponent } from "../../../shared/Components/toolbar/toolbar.component";


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [ CommonModule, DialogModule, ButtonModule, ToolbarComponent],//ToolbarComponent
  providers: [DialogService],
})
export class AdminDashboardComponent {
  components: { component: Type<any>; label: string }[] = [
    // { component: ProductDetailComponent, label: 'product-detail' },
    // { component: CustomerdetailsComponent, label: 'customer' },
    // { component: CustomerListComponent, label: 'custoemrList' },
    // { component: CustomerMasterComponent, label: 'custoemrMaster' },
    // { component: CustomerdetailsComponent, label: 'customerdetails' },
    // { component: GstInvoiceComponent, label: 'Revenue' },
    // { component: InvoiceViewComponent, label: 'invoice view' },
    // { component: AnalyticsComponent, label: 'Analytics' },
    // { component: NotificationsComponent, label: 'Notifications' },
  ];
  dialogRefs: DynamicDialogRef[] = [];

  constructor(private dialogService: DialogService) {}

  openDialog(component: Type<any>, event: MouseEvent) {
    event.stopPropagation(); // Prevent drag from triggering when button is clicked
    const ref = this.dialogService.open(component, {
      header: component.name,
      width: '90%',
      height:'80%',
      closable:true,
      draggable: true,
      contentStyle: { overflow: 'auto' },
    });
    this.dialogRefs.push(ref);

    ref.onClose.subscribe(() => {
      this.dialogRefs = this.dialogRefs.filter((r) => r !== ref);
    });
  }
}



// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DndModule, DndDropEvent } from 'ngx-drag-drop';
// import { animate, style, transition, trigger } from '@angular/animations';
// import { UserStatsComponent } from './user-stats/user-stats.component';
// import { CustomerListComponent } from './customer-list/customer-list.component';
// import { ProductOverviewComponent } from './product-overview/product-overview.component';
// import { SalesChartComponent } from './sales-chart/sales-chart.component';
// import { OrderStatsComponent } from './order-stats/order-stats.component';
// import { InventoryComponent } from './inventory/inventory.component';
// import { RevenueComponent } from './revenue/revenue.component';
// import { TasksComponent } from './tasks/tasks.component';
// import { AnalyticsComponent } from './analytics/analytics.component';
// import { NotificationsComponent } from './notifications/notifications.component';

// // Dummy Data Interfaces
// interface User { id: number; name: string; email: string; role: string; }
// interface Customer { id: number; name: string; email: string; orders: number; }
// interface Product { id: number; name: string; price: number; stock: number; }
// interface Sale { id: number; date: string; amount: number; status: string; }

// const dummyData = {
//   users: [
//     { id: 1, name: 'Admin X', email: 'admin@x.com', role: 'admin' },
//     { id: 2, name: 'Staff Y', email: 'staff@y.com', role: 'staff' },
//   ],
//   customers: [
//     { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5 },
//     { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 3 },
//   ],
//   products: [
//     { id: 1, name: 'Quantum Widget', price: 99.99, stock: 50 },
//     { id: 2, name: 'Gizmo Flux', price: 149.99, stock: 20 },
//   ],
//   sales: [
//     { id: 1, date: '2025-02-01', amount: 499.95, status: 'completed' },
//     { id: 2, date: '2025-02-02', amount: 299.97, status: 'pending' },
//   ],
// };

// interface DashboardComponent {
//   id: string;
//   type: string; // Add type property
//   data: any;
//   effectAllowed: 'move';
// }

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     DndModule,
//     UserStatsComponent,
//     CustomerListComponent,
//     ProductOverviewComponent,
//     SalesChartComponent,
//     OrderStatsComponent,
//     InventoryComponent,
//     RevenueComponent,
//     TasksComponent,
//     AnalyticsComponent,
//     NotificationsComponent,
//   ],
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css'],
//   animations: [
//     trigger('fadeIn', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'scale(0.9)' }),
//         animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
//       ]),
//     ]),
//     trigger('slideIn', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateY(20px)' }),
//         animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
//       ]),
//     ]),
//   ],
// })
// export class AdminDashboardComponent {
//   components: DashboardComponent[] = [
//     { id: 'user-stats-1', type: 'user-stats', data: dummyData.users, effectAllowed: 'move' as const }, // Added type
//     { id: 'customer-list-1', type: 'customer-list', data: dummyData.customers, effectAllowed: 'move' as const }, // Added type
//     { id: 'product-overview-1', type: 'product-overview', data: dummyData.products, effectAllowed: 'move' as const }, // Added type
//     { id: 'sales-chart-1', type: 'sales-chart', data: dummyData.sales, effectAllowed: 'move' as const }, // Added type
//     { id: 'order-stats-1', type: 'order-stats', data: [], effectAllowed: 'move' as const }, // Added type
//     { id: 'inventory-1', type: 'inventory', data: [], effectAllowed: 'move' as const }, // Added type
//     { id: 'revenue-1', type: 'revenue', data: [], effectAllowed: 'move' as const }, // Added type
//     { id: 'tasks-1', type: 'tasks', data: [], effectAllowed: 'move' as const }, // Added type
//     { id: 'analytics-1', type: 'analytics', data: [], effectAllowed: 'move' as const }, // Added type
//     { id: 'notifications-1', type: 'notifications', data: [], effectAllowed: 'move' as const }, // Added type
//   ];

//   componentCounter = this.components.length + 1;

//   onDrop(event: DndDropEvent, targetId: string) {
//     console.log(`Dropped ${event.data.id} onto ${targetId}`);
//     const draggedIndex = this.components.findIndex(c => c.id === event.data.id);
//     const targetIndex = this.components.findIndex(c => c.id === targetId);
//     if (draggedIndex !== -1 && targetIndex !== -1) {
//       const [draggedItem] = this.components.splice(draggedIndex, 1);
//       this.components.splice(targetIndex, 0, draggedItem);
//     }
//   }

//   onDragStart(event: DragEvent, id: string) {
//     console.log(`Drag started for ${id}`, event);
//   }

//   onDragEnd(event: DragEvent, id: string) {
//     console.log(`Drag ended for ${id}`, event);
//   }

//   addComponent(componentType: string) { // Accept componentType argument
//     const newComponentId = `${componentType}-${this.componentCounter++}`;
//     let newData;

//     switch (componentType) {
//       case 'user-stats':
//         newData = dummyData.users;
//         break;
//       case 'customer-list':
//         newData = dummyData.customers;
//         break;
//       case 'product-overview':
//         newData = dummyData.products;
//         break;
//       case 'sales-chart':
//         newData = dummyData.sales;
//         break;
//       default:
//         newData = []; // Default data if needed
//         break;
//     }

//     this.components.push({
//       id: newComponentId,
//       type: componentType, // Set the type
//       data: Date.now(),
//       effectAllowed: 'move' as const
//     });
//   }
// }