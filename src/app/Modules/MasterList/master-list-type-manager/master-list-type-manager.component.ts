
import { CommonModule } from '@angular/common';
import { MasterListService } from '../../../core/services/masterLists.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService, Footer } from 'primeng/api';
import { Dialog } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";

@Component({
  selector: 'app-master-list-type-manager',
  templateUrl: './master-list-type-manager.component.html',
  styleUrls: ['./master-list-type-manager.component.css'],
  providers: [MessageService, ConfirmationService,Footer],
  imports: [Dialog, FormsModule, CommonModule, ButtonModule, TableModule]
})
export class MasterListTypeManagerComponent implements OnInit {
  types: any[] = [];
  typeDialog: boolean = false;
  editingType: any = null;

  constructor(
    private masterListService: MasterListService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes() {
    this.masterListService.getTypeOptions().subscribe((res: any) => {
      this.types = res.data || res;
    });
  }

  openNew() {
    this.editingType = { value: '', label: '', description: '' };
    this.typeDialog = true;
  }

  saveType() {
    if (this.editingType.value && this.editingType.label) {
      this.masterListService.createType(this.editingType).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Type created' });
        this.loadTypes();
        this.typeDialog = false;
      });
    }
  }

  deleteType(type: any) {
    this.confirmationService.confirm({
      message: `Delete type ${type.label}?`,
      accept: () => {
        this.masterListService.deleteType(type.value).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Type deleted' });
          this.loadTypes();
        });
      }
    });
  }
}
