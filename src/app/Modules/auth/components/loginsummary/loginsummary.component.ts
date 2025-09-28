import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login-summary-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, CardModule],
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

// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
// import { ButtonModule } from 'primeng/button';
// import { TableModule } from 'primeng/table';

// @Component({
//   selector: 'app-login-summary-dialog',
//   standalone: true,
//   imports: [CommonModule, ButtonModule, TableModule],
//   templateUrl: './login-summary-dialog.component.html',
//   styleUrls: ['./login-summary-dialog.component.css'],
// })
// export class LoginSummaryDialogComponent {
//   public notes: any[] = [];

//   constructor(
//     public ref: DynamicDialogRef,
//     public config: DynamicDialogConfig
//   ) {
//     // Get the data passed from parent
//     if (config.data) {
//       this.notes = config.data.notes || [];
//     }
//   }

//   closeDialog() {
//     this.ref.close();
//   }
// }

