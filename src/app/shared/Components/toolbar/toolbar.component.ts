// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-toolbar',
//   imports: [],
//   templateUrl: './toolbar.component.html',
//   styleUrl: './toolbar.component.css'
// })
// export class ToolbarComponent {

// }

// import { Component, ContentChildren, TemplateRef, QueryList, AfterContentInit, Input } from '@angular/core';
// import { ToolbarModule } from 'primeng/toolbar';
// import { CommonModule } from '@angular/common';
// @Component({
//   selector: 'app-common-header',
//   imports: [ToolbarModule, CommonModule],
//   templateUrl: './toolbar.component.html',
//   styleUrl: './toolbar.component.css'
// })
// export class ToolbarComponent implements AfterContentInit {
//   // @Input() gridHeight: any;
//   @Input() gridWidth: any
//   // @Input() padding: any
//   ngOnInit(): void {
//     // this.gridHeight = this.gridHeight ? this.gridHeight : '650px'
//     this.gridWidth = this.gridWidth ? this.gridWidth : '100%'
//     // this.padding = this.padding ? this.padding : '20px 30px'
//   }
//   // @ContentChildren(TemplateRef) contentTemplates!: QueryList<TemplateRef<any>>;
//   // contentItems: TemplateRef<any>[] = [];

//   // ngAfterContentInit() {
//   //   this.contentItems = this.contentTemplates.toArray();
//   // }

//   @ContentChildren(TemplateRef) contentTemplates!: QueryList<TemplateRef<any>>;
//   contentItems: TemplateRef<any>[] = [];

//   ngAfterContentInit() {
//     this.contentItems = this.contentTemplates.toArray();
//   }
// }
import { Component, ContentChildren, TemplateRef, QueryList, AfterContentInit, Input } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-common-header',
  imports: [ToolbarModule, CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements AfterContentInit {
  @Input() gridWidth: string | number = '100%';

  @ContentChildren(TemplateRef) contentTemplates!: QueryList<TemplateRef<any>>;
  contentItems: TemplateRef<any>[] = [];

  ngAfterContentInit() {
    this.contentItems = this.contentTemplates.toArray();
  }
}