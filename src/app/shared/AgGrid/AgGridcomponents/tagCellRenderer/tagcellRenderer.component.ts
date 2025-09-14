import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { TransactionService } from '../../../../core/services/transaction.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TagModule } from 'primeng/tag';

// 🔹--- Define a specific type for PrimeNG tag severities ---
type TagSeverity = "success" | "secondary" | "info" | "warn" | "danger" | "contrast";

// 🔹--- Enhanced Custom Cell Renderer with Icons ---
@Component({
    selector: 'app-tag-cell-renderer',
    standalone: true,
    imports: [TagModule, CommonModule],
    // ✅ Add the [icon] property to display icons within the tag
    template: `<p-tag *ngIf="value" [value]="value" [severity]="severity" [icon]="icon" styleClass="px-2 py-1 text-xs font-semibold rounded-md"></p-tag>`
})
export class TagCellRendererComponent implements ICellRendererAngularComp {
    public value: any;
    public severity: TagSeverity = 'info';
    public icon: string = ''; // ✅ New property for the icon

    agInit(params: ICellRendererParams): void {
        this.updateValues(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.updateValues(params);
        return true;
    }

    private updateValues(params: ICellRendererParams): void {
        this.value = params.value;
        const tagProps = this.getTagProperties(params.value, params.colDef?.field);
        this.severity = tagProps.severity;
        this.icon = tagProps.icon;
    }

    // ✅ This new method returns both severity and a matching icon
    private getTagProperties(value: string, field?: string): { severity: TagSeverity, icon: string } {
        const lowerCaseValue = String(value).toLowerCase();

        if (field === 'type') {
            switch (lowerCaseValue) {
                case 'sale': return { severity: 'info', icon: 'pi pi-shopping-cart' };
                case 'payment': return { severity: 'success', icon: 'pi pi-money-bill' };
                case 'refund': return { severity: 'warn', icon: 'pi pi-undo' };
                case 'customer': return { severity: 'contrast', icon: 'pi pi-user' };
                case 'product': return { severity: 'secondary', icon: 'pi pi-box' };
                default: return { severity: 'secondary', icon: 'pi pi-info-circle' };
            }
        }

        if (field === 'status') {
            switch (lowerCaseValue) {
                case 'completed':
                case 'active':
                    return { severity: 'success', icon: 'pi pi-check-circle' };
                case 'pending':
                    return { severity: 'warn', icon: 'pi pi-clock' };
                case 'failed':
                case 'unpaid':
                    return { severity: 'danger', icon: 'pi pi-exclamation-triangle' };
                default:
                    return { severity: 'secondary', icon: 'pi pi-question-circle' };
            }
        }
        
        return { severity: 'info', icon: 'pi pi-info-circle' }; // Default
    }
}

// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { GridApi, GridReadyEvent } from 'ag-grid-community';
// import { TransactionService } from '../../../../core/services/transaction.service';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { SelectModule } from 'primeng/select';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { ICellRendererAngularComp } from 'ag-grid-angular';
// import { ICellRendererParams } from 'ag-grid-community';
// import { TagModule } from 'primeng/tag';

// // 🔹--- Define a specific type for PrimeNG tag severities ---
// type TagSeverity = "success" | "secondary" | "info" | "warn" | "danger" | "contrast";

// // 🔹--- New Custom Cell Renderer Component for PrimeNG Tags ---
// @Component({
//     selector: 'app-tag-cell-renderer',
//     standalone: true,
//     imports: [TagModule, CommonModule],
//     // ✅ Use styleClass to add padding, rounded corners, and adjust text for a modern look
//     template: `<p-tag *ngIf="value" [value]="value" [severity]="severity" styleClass="px-2 py-1 text-xs font-semibold rounded-md"></p-tag>`
// })
// export class TagCellRendererComponent implements ICellRendererAngularComp {
//     public value: any;
//     public severity: TagSeverity = 'info'; // ✅ Use the specific type

//     agInit(params: ICellRendererParams): void {
//         this.updateValues(params);
//     }

//     refresh(params: ICellRendererParams): boolean {
//         this.updateValues(params);
//         return true;
//     }

//     private updateValues(params: ICellRendererParams): void {
//         this.value = params.value;
//         // ✅ Use optional chaining to safely access 'field'
//         this.severity = this.getSeverity(params.value, params.colDef?.field);
//     }

//     private getSeverity(value: string, field?: string): TagSeverity { // ✅ Use the specific type as return type
//         const lowerCaseValue = String(value).toLowerCase();

//         if (field === 'type') {
//             switch (lowerCaseValue) {
//                 case 'sale': return 'info';
//                 case 'payment': return 'success';
//                 case 'refund': return 'warn';
//                 case 'customer': return 'contrast';
//                 case 'seller': return 'warn';
//                 case 'product': return 'secondary';
//                 default: return 'secondary';
//             }
//         }

//         if (field === 'status') {
//             switch (lowerCaseValue) {
//                 case 'completed':
//                 case 'active':
//                     return 'success';
//                 case 'pending':
//                     return 'warn';
//                 case 'failed':
//                 case 'unpaid':
//                     return 'danger';
//                 default:
//                     return 'secondary';
//             }
//         }
        
//         return 'info'; // Default severity
//     }
// }
