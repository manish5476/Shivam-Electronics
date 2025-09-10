import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Core Services
import { MasterListService } from '../../../core/services/masterLists.service';

@Component({
  selector: 'app-master-list-type-manager',
  templateUrl: './master-list-type-manager.component.html',
  standalone: true, // Converted to standalone for consistency
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class MasterListTypeManagerComponent implements OnInit {
  types: any[] = [];
  typeDialog: boolean = false;

  // ✅ CORRECTED: Use 'name' and 'type' to match the backend model
  editingType: any = { name: '', type: '', description: '' };

  submitted: boolean = false;
  isNew: boolean = false;

  constructor(
    private masterListService: MasterListService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes() {
    // ✅ CORRECTED: Always expect the { data: [...] } wrapper from the API
    this.masterListService.getAllTypes().subscribe((res: any) => {
      this.types = res.data || [];
    });
  }

  openNew() {
    this.editingType = { name: '', type: '', description: '' };
    this.submitted = false;
    this.isNew = true;
    this.typeDialog = true;
  }

  hideDialog() {
    this.typeDialog = false;
    this.submitted = false;
  }

  saveType() {
    this.submitted = true;

    // Basic validation
    if (!this.editingType.name?.trim() || !this.editingType.type?.trim()) {
      return;
    }

    // Use the correct service method (only create is shown in your example)
    this.masterListService.createType(this.editingType).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Type Created' });
        this.loadTypes(); // Refresh the list
        this.hideDialog();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Could not save type' });
      }
    });
  }

  deleteType(type: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the type "${type.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // ✅ CORRECTED: The delete endpoint uses the 'type' value
        this.masterListService.deleteType(type.type).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Type deleted successfully' });
                this.loadTypes(); // Refresh the list
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message
// import { Component, OnInit } from '@angular/core';
// import { MasterListService } from '../../../core/services/masterLists.service';
// import { ConfirmationService, MessageService } from 'primeng/api';
// import { Select } from 'primeng/select';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { TableModule } from "primeng/table";
// import { Dialog } from "primeng/dialog";
// @Component({
//   selector: 'app-master-list-type-manager',
//   templateUrl: './master-list-type-manager.component.html',
//   styleUrls: ['./master-list-type-manager.component.css'],
//   providers: [MessageService, ConfirmationService],
//   imports: [ FormsModule, CommonModule, TableModule, Dialog],
// })
// export class MasterListTypeManagerComponent implements OnInit {
//   types: any[] = [];
//   typeDialog: boolean = false;
//   editingType: any = null;

//   constructor(
//     private masterListService: MasterListService,
//     private messageService: MessageService,
//     private confirmationService: ConfirmationService
//   ) { }

//   ngOnInit(): void {
//     this.loadTypes();
//   }

//   loadTypes() {
//     this.masterListService.getTypeOptions().subscribe((res: any) => {
//       this.types = res.data || res;
//     });
//   }

//   openNew() {
//     this.editingType = { value: '', label: '', description: '' };
//     this.typeDialog = true;
//   }

//   saveType() {
//     if (this.editingType.value && this.editingType.label) {
//       this.masterListService.createType(this.editingType).subscribe(() => {
//         this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Type created' });
//         this.loadTypes();
//         this.typeDialog = false;
//       });
//     }
//   }

//   deleteType(type: any) {
//     this.confirmationService.confirm({
//       message: `Delete type ${type.label}?`,
//       accept: () => {
//         this.masterListService.deleteType(type.value).subscribe(() => {
//           this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Type deleted' });
//           this.loadTypes();
//         });
//       }
//     });
//   }
// }
