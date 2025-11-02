import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-login-summary-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, CardModule, Toast],
  templateUrl: './login-summary-dialog.component.html',
  styleUrls: ['./login-summary-dialog.component.css'],
})
export class LoginSummaryDialogComponent {
  public summaryData: any = {};

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    if (config.data) {
      this.summaryData = config.data;
    }
  }

  closeDialog() {
    this.ref.close();
  }
}

