import { Component, OnInit } from '@angular/core';
import { MasterListService } from '../../../core/services/masterLists.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from "primeng/table";
import { Dialog } from "primeng/dialog";
@Component({
  selector: 'app-master-list-type-manager',
  templateUrl: './master-list-type-manager.component.html',
  styleUrls: ['./master-list-type-manager.component.css'],
  providers: [MessageService, ConfirmationService],
  imports: [ FormsModule, CommonModule, TableModule, Dialog],
})
export class MasterListTypeManagerComponent implements OnInit {
  types: any[] = [];
  typeDialog: boolean = false;
  editingType: any = null;

  constructor(
    private masterListService: MasterListService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

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
