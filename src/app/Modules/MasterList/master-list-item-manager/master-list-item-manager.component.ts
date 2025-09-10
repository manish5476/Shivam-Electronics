import { CommonModule } from '@angular/common';
import { MasterListService } from '../../../core/services/masterLists.service';
import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService, Footer } from 'primeng/api';
import { Checkbox } from "primeng/checkbox";
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Dialog } from "primeng/dialog";
import { Select } from 'primeng/select';

@Component({
  selector: 'app-master-list-item-manager',
  templateUrl: './master-list-item-manager.component.html',
  styleUrls: ['./master-list-item-manager.component.scss'],
  providers: [MessageService, ConfirmationService,Footer],
  imports: [Checkbox, CommonModule, FormsModule, TableModule,Select, Dialog]
})
export class MasterListItemManagerComponent implements OnInit {
  types: any[] = [];
  selectedType: string | null = null;
  items: any[] = [];

  itemDialog: boolean = false;
  editingItem: any = null;

  constructor(
    private masterListService: MasterListService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {} 

  ngOnInit(): void {
    this.loadTypes();
  }

  editItem(item:any){

  }

  loadTypes() {
    this.masterListService.getTypeOptions().subscribe((res: any) => {
      this.types = res.data || res;
    });
  }

  onTypeChange() {
    if (this.selectedType) {
      this.masterListService.getType(this.selectedType).subscribe((res: any) => {
        this.items = res.data.items;
      });
    }
  }

  openNew() {
    this.editingItem = { label: '', value: '', isActive: true };
    this.itemDialog = true;
  }

  saveItem() {
    if (!this.selectedType) return;
    if (this.editingItem.id) {
      this.masterListService
        .updateItem(this.selectedType, this.editingItem.id, this.editingItem)
        .subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Item updated' });
          this.onTypeChange();
          this.itemDialog = false;
        });
    } else {
      this.masterListService
        .addItem(this.selectedType, this.editingItem)
        .subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Item added' });
          this.onTypeChange();
          this.itemDialog = false;
        });
    }
  }

  deleteItem(item: any) {
    this.confirmationService.confirm({
      message: `Delete ${item.label}?`,
      accept: () => {
        this.masterListService.deleteItem(this.selectedType!, item.id).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Item deleted' });
          this.onTypeChange();
        });
      }
    });
  }
}
