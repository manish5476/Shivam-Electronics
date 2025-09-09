import { Component, OnInit } from '@angular/core';
import { MasterListService } from '../../../core/services/masterLists.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
// Import ReactiveFormsModule here
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { TableModule } from "primeng/table";
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-master-list-manager',
  templateUrl: './master-list-manager.component.html',
  styleUrls: ['./master-list-manager.component.css'],
  imports: [Select, FormsModule, ReactiveFormsModule, CommonModule, TableModule, Dialog],
  providers: [ConfirmationService, MessageService]
})
export class MasterListManagerComponent implements OnInit {
  createForm!: FormGroup;
  typeOptions: any[] = [];
  selectedType: string | null = null;
  items: any[] = [];
  newItem: any = { name: '', value: '' };

  constructor(private fb: FormBuilder, private masterListService: MasterListService) {}

  ngOnInit() {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required]
    });
    this.loadTypes();
  }

  /** Master Type CRUD */
  createMasterType() {
    if (this.createForm.valid) {
      this.masterListService.createType(this.createForm.value).subscribe(() => {
        this.createForm.reset();
        this.loadTypes();
      });
    }
  }

  loadTypes() {
    this.masterListService.getTypeOptions().subscribe((res) => {
      this.typeOptions = res;
    });
  }

  deleteType() {
    if (this.selectedType) {
      this.masterListService.deleteType(this.selectedType).subscribe(() => {
        this.selectedType = null;
        this.items = [];
        this.loadTypes();
      });
    }
  }

  /** Items CRUD */
  loadItems() {
    if (!this.selectedType) return;
    this.masterListService.getType(this.selectedType).subscribe((res) => {
      this.items = res.items || [];
    });
  }

  addItem() {
    if (!this.newItem.name || !this.newItem.value) return;
    this.masterListService.addItem(this.selectedType!, this.newItem).subscribe((res) => {
      this.items.push(res);
      this.newItem = { name: '', value: '' };
    });
  }

  updateItem(item: any) {
    this.masterListService.updateItem(this.selectedType!, item._id || item.id, item).subscribe(() => {
      item.editing = false;
    });
  }

  deleteItem(item: any) {
    this.masterListService.deleteItem(this.selectedType!, item._id || item.id).subscribe(() => {
      this.items = this.items.filter((i) => i !== item);
    });
  }
}


// MasterListManagerComponent implements OnInit {
//   types: any[] = [];
//   selectedType: string | null = null;
//   items: any[] = [];

//   // Dialog states
//   itemDialog: boolean = false;
//   editingItem: any = null;

//   constructor(
//     private masterListService: MasterListService,
//     private confirmationService: ConfirmationService,
//     private messageService: MessageService
//   ) {}

//   ngOnInit(): void {
//     this.loadTypes();
//   }

//   loadTypes() {
//     this.masterListService.getTypeOptions().subscribe((res: any) => {
//       this.types = res.data || res; // handle API shape
//     });
//   }

//   onTypeChange() {
//     if (this.selectedType) {
//       this.masterListService.getType(this.selectedType).subscribe((res: any) => {
//         this.items = res.data.items;
//       });
//     }
//   }

//   openNew() {
//     this.editingItem = { label: '', value: '', isActive: true };
//     this.itemDialog = true;
//   }

//   editItem(item: any) {
//     this.editingItem = { ...item };
//     this.itemDialog = true;
//   }

//   saveItem() {
//     if (!this.selectedType) return;

//     if (this.editingItem.id) {
//       // Update
//       this.masterListService
//         .updateItem(this.selectedType, this.editingItem.id, this.editingItem)
//         .subscribe(() => {
//           this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Item updated' });
//           this.onTypeChange();
//           this.itemDialog = false;
//         });
//     } else {
//       // Add
//       this.masterListService
//         .addItem(this.selectedType, this.editingItem)
//         .subscribe(() => {
//           this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Item added' });
//           this.onTypeChange();
//           this.itemDialog = false;
//         });
//     }
//   }

//   deleteItem(item: any) {
//     if (!this.selectedType) return;
//     this.confirmationService.confirm({
//       message: `Delete ${item.label}?`,
//       accept: () => {
//         this.masterListService.deleteItem(this.selectedType!, item.id).subscribe(() => {
//           this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Item deleted' });
//           this.onTypeChange();
//         });
//       }
//     });
//   }
// }
