import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Correct import for p-confirmDialog

// Core Services
import { MasterListService } from '../../../core/services/masterLists.service';

@Component({
  selector: 'app-master-list-manager',
  templateUrl: './master-list-manager.component.html',
  styleUrls: ['./master-list-manager.component.css'],

  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    Select,
    ToastModule,
    InputTextModule,
    ButtonModule,
    ConfirmDialogModule, // Correct import
  ],
  providers: [ConfirmationService, MessageService],
})

export class MasterListManagerComponent implements OnInit {
  createForm!: FormGroup;
  typeOptions: any[] = [];
  selectedType: string | null = null;
  items: any[] = [];
  clonedItems: { [s: string]: any } = {};
  // UPDATED: Use 'label' and 'value' for newItem
  newItem: any = { label: '', value: '' };

  constructor(
    private fb: FormBuilder,
    private masterListService: MasterListService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // UPDATED: Use 'label' and 'value' for the form controls
    this.createForm = this.fb.group({
      label: ['', Validators.required],
      value: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]],
    });
    this.loadTypes();
  }

  // --- Master Type CRUD ---

  createMasterType() {
    if (this.createForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Form', detail: 'Please fill out all required fields.' });
      return;
    }
    this.masterListService.createType(this.createForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Master Type created successfully' });
        this.createForm.reset();
        this.loadTypes();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Could not create type' })
    });
  }

  loadTypes() {
    this.masterListService.getTypeOptions().subscribe((res: any) => {
      this.typeOptions = res.data || [];
    });
  }

  deleteType() {
    if (!this.selectedType) return;
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this entire type and all its items?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.masterListService.deleteType(this.selectedType!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'The type was deleted.' });
            this.selectedType = null;
            this.items = [];
            this.loadTypes();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Could not delete type' })
        });
      }
    });
  }

  // --- Items CRUD ---
  // --- Items CRUD ---

  loadItems() {
    if (!this.selectedType) {
      this.items = [];
      return;
    }
    this.masterListService.getType(this.selectedType).subscribe((res: any) => {
      this.items = res.data?.items || [];
    });
  }
  // loadItems() {
  //   if (!this.selectedType) {
  //     this.items = [];
  //     return;
  //   }
  //   this.masterListService.getType(this.selectedType).subscribe((res: any) => {
  //     this.items = res.data?.items || [];
  //   });
  // }

  addItem() {
    if (!this.newItem.label || !this.newItem.value) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Info', detail: 'Please provide both label and value for the new item.' });
      return;
    }

    this.masterListService.addItem(this.selectedType!, this.newItem).subscribe({
      next: (res: any) => {
        this.loadItems();
        this.newItem = { label: '', value: '' };
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item added successfully' });
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Could not add item' })
    });
  }

  onRowEditInit(item: any) {
    this.clonedItems[item.id] = { ...item };  // ✅ Use id not _id
  }

  onRowEditSave(item: any) {
    this.masterListService.updateItem(this.selectedType!, item.id, item).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item updated' });
        delete this.clonedItems[item.id];
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        this.onRowEditCancel(item, this.items.findIndex(i => i.id === item.id));
      }
    });
  }

  onRowEditCancel(item: any, index: number) {
    this.items[index] = this.clonedItems[item.id];
    delete this.clonedItems[item.id];
  }

  deleteItem(item: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the item "${item.label}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.masterListService.deleteItem(this.selectedType!, item.id).subscribe({  // ✅ use id
          next: () => {
            this.items = this.items.filter((i) => i.id !== item.id);
            this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Item deleted' });
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Could not delete item' })
        });
      }
    });
  }
}