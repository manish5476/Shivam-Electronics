
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICellRendererAngularComp, ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, ICellEditorParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TooltipModule } from 'primeng/tooltip';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { KeyFilterModule } from 'primeng/keyfilter';
import { KnobModule } from 'primeng/knob';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { GridContext } from '../ag-grid-reference/ag-grid-reference.component';

export interface CellChangedEvent {
  oldValue: any;
  newValue: any;
  field: string;
  data: any;
  node: any;
  colDef: any;
  event?: any;
}

type ValueChangedCallback = (eventData: CellChangedEvent) => void;

@Component({
  selector: 'app-dynamic-cell',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ColorPickerModule,
    TooltipModule,
    CascadeSelectModule,
    AutoCompleteModule,
    CheckboxModule,
    DatePickerModule,
    InputMaskModule,
    KeyFilterModule,
    KnobModule,
    MultiSelectModule,
    SelectModule,
  ],
  template: `
    <div [ngSwitch]="type" class="dynamic-cell-container w-full h-full flex items-center p-0 m-0">
      <input *ngSwitchCase="'text'" pInputText [id]="params.colDef?.field + '-' + params.node.rowIndex"
             class="w-full p-inputtext-sm" [(ngModel)]="value" (ngModelChange)="onValueChange($event)"
             [placeholder]="inputConfig?.placeholder ?? ''" [disabled]="!isEditing()"
             [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
             [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName" />

      <div *ngSwitchCase="'number'" class="w-full">
        <p-inputNumber class="w-full" [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value"
                       (onInput)="onValueChange($event.value)" [mode]="inputConfig?.mode ?? 'decimal'"
                       [minFractionDigits]="inputConfig?.minFractionDigits ?? null"
                       [maxFractionDigits]="inputConfig?.maxFractionDigits ?? null"
                       [useGrouping]="inputConfig?.useGrouping ?? true" [placeholder]="inputConfig?.placeholder ?? ''"
                       [min]="inputConfig?.min ?? null" [max]="inputConfig?.max ?? null" [step]="inputConfig?.step ?? 1"
                       [prefix]="inputConfig?.prefix ?? ''" [suffix]="inputConfig?.suffix ?? ''" [disabled]="!isEditing()"
                       [readonly]="inputConfig?.readonly ?? false" (keypress)="preventE($event)"
                       [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
                       [attr.aria-label]="params.colDef?.headerName">
        </p-inputNumber>
      </div>

      <div *ngSwitchCase="'select'" class="w-full">
        <p-select [inputId]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value" [options]="options"
                  [optionLabel]="inputConfig?.optionLabel ?? null" [optionValue]="inputConfig?.optionValue ?? null"
                  [placeholder]="inputConfig?.placeholder ?? 'Select'" [checkmark]="inputConfig?.checkmark ?? false"
                  [showClear]="inputConfig?.showClear ?? false" [editable]="inputConfig?.editable ?? false"
                  [filter]="inputConfig?.filter ?? false" [styleClass]="inputConfig?.styleClass ?? 'w-full'" appendTo="body"
                  [disabled]="!isEditing()" [readonly]="inputConfig?.readonly ?? false"
                  [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
                  [attr.aria-label]="params.colDef?.headerName">
        </p-select>
      </div>

      <div *ngSwitchCase="'colorpicker'" class="w-full flex items-center space-x-2">
        <span *ngIf="inputConfig?.showValue" class="text-xs truncate flex-shrink mr-1" [pTooltip]="value"
              tooltipPosition="top">
        </span>
        <p-colorPicker [id]="params.colDef?.field + '-' + params.node.rowIndex" appendTo="body" [(ngModel)]="value"
                       (ngModelChange)="onValueChange($event)" [format]="inputConfig?.format ?? 'hex'"
                       [inline]="inputConfig?.inline ?? false" [styleClass]="'p-inputtext-sm'" [disabled]="!isEditing()"
                       [pTooltip]="inputConfig?.tooltip ?? 'Select Color'"
                       [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
        </p-colorPicker>
      </div>

      <p-autoComplete *ngSwitchCase="'autocomplete'" class="w-full"
                      [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value"
                      (completeMethod)="onValueChange($event)" (onSelect)="onValueChange($event)" [suggestions]="options"
                      [field]="inputConfig?.field ?? null" [dropdown]="inputConfig?.dropdown ?? false"
                      [forceSelection]="inputConfig?.forceSelection ?? false" [minLength]="inputConfig?.minLength ?? 1"
                      [placeholder]="inputConfig?.placeholder ?? 'Search...'" appendTo="body" [disabled]="!isEditing()"
                      [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
                      [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
      </p-autoComplete>

      <p-cascadeSelect *ngSwitchCase="'cascadeselect'" class="w-full"
                       [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value" [options]="options"
                       [optionLabel]="inputConfig?.optionLabel ?? 'cname'" [optionGroupLabel]="inputConfig?.optionGroupLabel ?? 'name'"
                       [optionGroupChildren]="inputConfig?.optionGroupChildren ?? ['states', 'cities']"
                       [style]="{ 'minWidth': inputConfig?.minWidth ?? '14rem' }"
                       [placeholder]="inputConfig?.placeholder ?? 'Select...'" [disabled]="!isEditing()"
                       [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
                       [attr.aria-label]="params.colDef?.headerName">
      </p-cascadeSelect>

      <div *ngSwitchCase="'checkbox'" class="w-full flex justify-content-center items-center">
        <p-checkbox [(ngModel)]="value" [binary]="inputConfig?.binary ?? true"
                    [id]="params.colDef?.field + '-' + params.node.rowIndex" [style]="inputConfig?.style ?? null"
                    [styleClass]="inputConfig?.styleClass ?? null" [disabled]="!isEditing()"
                    [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
                    [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
        </p-checkbox>
      </div>

      <p-inputMask *ngSwitchCase="'inputmask'" class="w-full" [id]="params.colDef?.field + '-' + params.node.rowIndex"
                   [(ngModel)]="value" [mask]="inputConfig?.mask ?? null" [placeholder]="inputConfig?.placeholder ?? ''"
                   [autoClear]="inputConfig?.autoClear ?? true" [disabled]="!isEditing()"
                   [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
                   [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
      </p-inputMask>

      <p-datepicker *ngSwitchCase="'datepicker'" class="w-full" [id]="params.colDef?.field + '-' + params.node.rowIndex"
                    [(ngModel)]="value" [showButtonBar]="inputConfig?.showButtonBar ?? false"
                    [readonlyInput]="inputConfig?.readonlyInput ?? false" [showTime]="inputConfig?.showTime ?? false"
                    [hourFormat]="inputConfig?.hourFormat ?? '24'" [timeOnly]="inputConfig?.timeOnly ?? false"
                    [view]="inputConfig?.view ?? 'date'" [dateFormat]="inputConfig?.dateFormat ?? 'mm/dd/yy'"
                    [numberOfMonths]="inputConfig?.numberOfMonths ?? 1" [placeholder]="inputConfig?.placeholder ?? 'Select a date'"
                    appendTo="body" [disabled]="!isEditing()" [pTooltip]="inputConfig?.tooltip ?? null"
                    [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
        <ng-template pTemplate="date" let-date>
          <strong *ngIf="inputConfig?.dateTemplateCondition && inputConfig?.dateTemplateCondition(date)"
                  style="text-decoration: line-through">
            {{ date.day }}
          </strong>
          <ng-template [ngIf]="!(inputConfig?.dateTemplateCondition && inputConfig?.dateTemplateCondition(date))">
            {{ date.day }}
          </ng-template>
        </ng-template>
      </p-datepicker>

      <div *ngSwitchCase="'keyfilteredinput'" class="w-full">
        <input type="text" pInputText class="w-full" [id]="params.colDef?.field + '-' + params.node.rowIndex"
               [(ngModel)]="value" [placeholder]="inputConfig?.placeholder ?? ''" [disabled]="!isEditing()"
               [readonly]="inputConfig?.readonly ?? false" [pKeyFilter]="inputConfig?.keyFilter ?? null"
               [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
               [attr.aria-label]="params.colDef?.headerName" />
      </div>

      <div *ngSwitchCase="'knob'" class="w-full flex justify-content-center items-center">
        <p-knob [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value"
                [valueColor]="inputConfig?.valueColor ?? 'var(--primary-color)'"
                [rangeColor]="inputConfig?.rangeColor ?? 'var(--surface-d)'" [size]="inputConfig?.size ?? 100"
                [step]="inputConfig?.step ?? 1" [min]="inputConfig?.min ?? 0" [max]="inputConfig?.max ?? 100"
                [disabled]="!isEditing()" [readonly]="inputConfig?.readonly ?? false"
                [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
                [attr.aria-label]="params.colDef?.headerName">
        </p-knob>
      </div>

      <div *ngSwitchCase="'multiselect'" class="w-full">
        <p-multiselect [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value" [options]="options"
                       [optionLabel]="inputConfig?.optionLabel ?? null" [optionValue]="inputConfig?.optionValue ?? null"
                       [placeholder]="inputConfig?.placeholder ?? 'Select'"
                       [maxSelectedLabels]="inputConfig?.maxSelectedLabels ?? null" [display]="inputConfig?.display ?? 'comma'"
                       [filter]="inputConfig?.filter ?? false" [styleClass]="inputConfig?.styleClass ?? 'w-full'" appendTo="body"
                       [disabled]="!isEditing()" [readonly]="inputConfig?.readonly ?? false"
                       [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
                       [attr.aria-label]="params.colDef?.headerName">
        </p-multiselect>
      </div>

      <input *ngSwitchDefault pInputText [id]="params.colDef?.field + '-' + params.node.rowIndex"
             class="w-full p-inputtext-sm" [(ngModel)]="value" (ngModelChange)="onValueChange($event)"
             [placeholder]="inputConfig?.placeholder ?? ''" [disabled]="!isEditing()"
             [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
             [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName" />
    </div>
  `,
  styles: [`
    .dynamic-cell-container {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: 100%;
    }
  `]
})
export class DynamicCellComponent implements ICellRendererAngularComp, ICellEditorAngularComp {
  @Output() actionTriggered = new EventEmitter<{ action: 'edit' | 'save' | 'cancel' | 'delete', rowData: any }>();

  params!: ICellRendererParams | ICellEditorParams;
  value: any;
  type: string = 'text';
  options: any[] = [];
  inputConfig: any = {};
  label: string | undefined;
  private valueChangedCallback: ValueChangedCallback | undefined;
  private context!: GridContext;

  // Cell Renderer Methods
  agInit(params: ICellRendererParams | ICellEditorParams): void {
    this.init(params);
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    if ('valueFormatted' in params) {
      this.init(params);
      return true;
    } else {
      this.init(params);
      return false;
    }
  }

  // Cell Editor Methods
  getGui(): HTMLElement {
    return this.params.eGridCell.querySelector('.dynamic-cell-container') as HTMLElement;
  }

  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    const input = this.getGui().querySelector('input, p-inputNumber, p-select, p-datepicker') as HTMLElement;
    if (input) {
      input.focus();
    }
  }

  getValue(): any {
    return this.value;
  }

  isPopup(): boolean {
    return false;
  }

  private init(params: ICellRendererParams | ICellEditorParams): void {
    this.params = params;
    this.value = params.value;
    this.context = params.context as GridContext;

    const cellParams = params?.colDef?.cellRendererParams || params?.colDef?.cellEditorParams || {};
    this.type = cellParams.type || 'text';
    this.options = cellParams.options || [];
    this.inputConfig = cellParams.inputConfig || {};
    this.label = cellParams.label;
    this.valueChangedCallback = cellParams.valueChangedCallback;
  }
  
  isEditing(): boolean {
    const isEditing = this.context?.isRowEditing(this.params.data?._id) ?? false;
    console.log('DynamicCell isEditing:', isEditing, 'Row ID:', this.params.data?._id, 'Context:', this.context);
    return isEditing;
  }

  onValueChange(newValue: any, originalEvent?: any): void {
    const oldValue = this.value;
    if (newValue === oldValue) return;
    this.value = newValue;
    if ('setValue' in this.params) {
      this.params.setValue?.(newValue);
    }

    if (this.valueChangedCallback) {
      const eventData: CellChangedEvent = {
        oldValue,
        newValue,
        field: this.params.colDef?.field!,
        data: this.params.data,
        node: this.params.node,
        colDef: this.params.colDef,
        event: originalEvent || newValue,
      };
      this.valueChangedCallback(eventData);
    }
  }

  preventE(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-'].includes(event.key) && !this.inputConfig?.allowScientificNotation) {
      event.preventDefault();
    }
  }
}

// import { Component, EventEmitter, Output } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ICellRendererAngularComp, ICellEditorAngularComp } from 'ag-grid-angular';
// import { ICellRendererParams, ICellEditorParams, IAfterGuiAttachedParams } from 'ag-grid-community';
// import { InputTextModule } from 'primeng/inputtext';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { DropdownModule } from 'primeng/dropdown';
// import { ColorPickerModule } from 'primeng/colorpicker';
// import { TooltipModule } from 'primeng/tooltip';
// import { CascadeSelectModule } from 'primeng/cascadeselect';
// import { AutoCompleteModule } from 'primeng/autocomplete';
// import { CheckboxModule } from 'primeng/checkbox';
// import { DatePickerModule } from 'primeng/datepicker';
// import { InputMaskModule } from 'primeng/inputmask';
// import { KeyFilterModule } from 'primeng/keyfilter';
// import { KnobModule } from 'primeng/knob';
// import { MultiSelectModule } from 'primeng/multiselect';
// import { SelectModule } from 'primeng/select';
// import { GridContext } from '../ag-grid-reference/ag-grid-reference.component'; // Adjust path as needed

// export interface CellChangedEvent {
//   oldValue: any;
//   newValue: any;
//   field: string;
//   data: any;
//   node: any;
//   colDef: any;
//   event?: any;
// }

// type ValueChangedCallback = (eventData: CellChangedEvent) => void;

// @Component({
//   selector: 'app-dynamic-cell',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     InputTextModule,
//     InputNumberModule,
//     DropdownModule,
//     ColorPickerModule,
//     TooltipModule,
//     CascadeSelectModule,
//     AutoCompleteModule,
//     CheckboxModule,
//     DatePickerModule,
//     InputMaskModule,
//     KeyFilterModule,
//     KnobModule,
//     MultiSelectModule,
//     SelectModule,
//   ],
//   template: `
//     <div [ngSwitch]="type" class="dynamic-cell-container w-full h-full flex items-center p-0 m-0">
//       <input *ngSwitchCase="'text'" pInputText [id]="params.colDef?.field + '-' + params.node.rowIndex"
//              class="w-full p-inputtext-sm" [(ngModel)]="value" (ngModelChange)="onValueChange($event)"
//              [placeholder]="inputConfig?.placeholder ?? ''" [disabled]="!isEditing()"
//              [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
//              [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName" />

//       <div *ngSwitchCase="'number'" class="w-full">
//         <p-inputNumber class="w-full" [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value"
//                        (onInput)="onValueChange($event.value)" [mode]="inputConfig?.mode ?? 'decimal'"
//                        [minFractionDigits]="inputConfig?.minFractionDigits ?? null"
//                        [maxFractionDigits]="inputConfig?.maxFractionDigits ?? null"
//                        [useGrouping]="inputConfig?.useGrouping ?? true" [placeholder]="inputConfig?.placeholder ?? ''"
//                        [min]="inputConfig?.min ?? null" [max]="inputConfig?.max ?? null" [step]="inputConfig?.step ?? 1"
//                        [prefix]="inputConfig?.prefix ?? ''" [suffix]="inputConfig?.suffix ?? ''" [disabled]="!isEditing()"
//                        [readonly]="inputConfig?.readonly ?? false" (keypress)="preventE($event)"
//                        [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
//                        [attr.aria-label]="params.colDef?.headerName">
//         </p-inputNumber>
//       </div>

//       <div *ngSwitchCase="'select'" class="w-full">
//         <p-select [inputId]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value" [options]="options"
//                   [optionLabel]="inputConfig?.optionLabel ?? null" [optionValue]="inputConfig?.optionValue ?? null"
//                   [placeholder]="inputConfig?.placeholder ?? 'Select'" [checkmark]="inputConfig?.checkmark ?? false"
//                   [showClear]="inputConfig?.showClear ?? false" [editable]="inputConfig?.editable ?? false"
//                   [filter]="inputConfig?.filter ?? false" [styleClass]="inputConfig?.styleClass ?? 'w-full'" appendTo="body"
//                   [disabled]="!isEditing()" [readonly]="inputConfig?.readonly ?? false"
//                   [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
//                   [attr.aria-label]="params.colDef?.headerName">
//         </p-select>
//       </div>

//       <div *ngSwitchCase="'colorpicker'" class="w-full flex items-center space-x-2">
//         <span *ngIf="inputConfig?.showValue" class="text-xs truncate flex-shrink mr-1" [pTooltip]="value"
//               tooltipPosition="top">
//         </span>
//         <p-colorPicker [id]="params.colDef?.field + '-' + params.node.rowIndex" appendTo="body" [(ngModel)]="value"
//                        (ngModelChange)="onValueChange($event)" [format]="inputConfig?.format ?? 'hex'"
//                        [inline]="inputConfig?.inline ?? false" [styleClass]="'p-inputtext-sm'" [disabled]="!isEditing()"
//                        [pTooltip]="inputConfig?.tooltip ?? 'Select Color'"
//                        [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
//         </p-colorPicker>
//       </div>

//       <p-autoComplete *ngSwitchCase="'autocomplete'" class="w-full"
//                       [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value"
//                       (completeMethod)="onValueChange($event)" (onSelect)="onValueChange($event)" [suggestions]="options"
//                       [field]="inputConfig?.field ?? null" [dropdown]="inputConfig?.dropdown ?? false"
//                       [forceSelection]="inputConfig?.forceSelection ?? false" [minLength]="inputConfig?.minLength ?? 1"
//                       [placeholder]="inputConfig?.placeholder ?? 'Search...'" appendTo="body" [disabled]="!isEditing()"
//                       [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
//                       [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
//       </p-autoComplete>

//       <p-cascadeSelect *ngSwitchCase="'cascadeselect'" class="w-full"
//                        [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value" [options]="options"
//                        [optionLabel]="inputConfig?.optionLabel ?? 'cname'" [optionGroupLabel]="inputConfig?.optionGroupLabel ?? 'name'"
//                        [optionGroupChildren]="inputConfig?.optionGroupChildren ?? ['states', 'cities']"
//                        [style]="{ 'minWidth': inputConfig?.minWidth ?? '14rem' }"
//                        [placeholder]="inputConfig?.placeholder ?? 'Select...'" [disabled]="!isEditing()"
//                        [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
//                        [attr.aria-label]="params.colDef?.headerName">
//       </p-cascadeSelect>

//       <div *ngSwitchCase="'checkbox'" class="w-full flex justify-content-center items-center">
//         <p-checkbox [(ngModel)]="value" [binary]="inputConfig?.binary ?? true"
//                     [id]="params.colDef?.field + '-' + params.node.rowIndex" [style]="inputConfig?.style ?? null"
//                     [styleClass]="inputConfig?.styleClass ?? null" [disabled]="!isEditing()"
//                     [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
//                     [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
//         </p-checkbox>
//       </div>

//       <p-inputMask *ngSwitchCase="'inputmask'" class="w-full" [id]="params.colDef?.field + '-' + params.node.rowIndex"
//                    [(ngModel)]="value" [mask]="inputConfig?.mask ?? null" [placeholder]="inputConfig?.placeholder ?? ''"
//                    [autoClear]="inputConfig?.autoClear ?? true" [disabled]="!isEditing()"
//                    [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
//                    [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
//       </p-inputMask>

//       <p-datepicker *ngSwitchCase="'datepicker'" class="w-full" [id]="params.colDef?.field + '-' + params.node.rowIndex"
//                     [(ngModel)]="value" [showButtonBar]="inputConfig?.showButtonBar ?? false"
//                     [readonlyInput]="inputConfig?.readonlyInput ?? false" [showTime]="inputConfig?.showTime ?? false"
//                     [hourFormat]="inputConfig?.hourFormat ?? '24'" [timeOnly]="inputConfig?.timeOnly ?? false"
//                     [view]="inputConfig?.view ?? 'date'" [dateFormat]="inputConfig?.dateFormat ?? 'mm/dd/yy'"
//                     [numberOfMonths]="inputConfig?.numberOfMonths ?? 1" [placeholder]="inputConfig?.placeholder ?? 'Select a date'"
//                     appendTo="body" [disabled]="!isEditing()" [pTooltip]="inputConfig?.tooltip ?? null"
//                     [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName">
//         <ng-template pTemplate="date" let-date>
//           <strong *ngIf="inputConfig?.dateTemplateCondition && inputConfig?.dateTemplateCondition(date)"
//                   style="text-decoration: line-through">
//             {{ date.day }}
//           </strong>
//           <ng-template [ngIf]="!(inputConfig?.dateTemplateCondition && inputConfig?.dateTemplateCondition(date))">
//             {{ date.day }}
//           </ng-template>
//         </ng-template>
//       </p-datepicker>

//       <div *ngSwitchCase="'keyfilteredinput'" class="w-full">
//         <input type="text" pInputText class="w-full" [id]="params.colDef?.field + '-' + params.node.rowIndex"
//                [(ngModel)]="value" [placeholder]="inputConfig?.placeholder ?? ''" [disabled]="!isEditing()"
//                [readonly]="inputConfig?.readonly ?? false" [pKeyFilter]="inputConfig?.keyFilter ?? null"
//                [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
//                [attr.aria-label]="params.colDef?.headerName" />
//       </div>

//       <div *ngSwitchCase="'knob'" class="w-full flex justify-content-center items-center">
//         <p-knob [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value"
//                 [valueColor]="inputConfig?.valueColor ?? 'var(--primary-color)'"
//                 [rangeColor]="inputConfig?.rangeColor ?? 'var(--surface-d)'" [size]="inputConfig?.size ?? 100"
//                 [step]="inputConfig?.step ?? 1" [min]="inputConfig?.min ?? 0" [max]="inputConfig?.max ?? 100"
//                 [disabled]="!isEditing()" [readonly]="inputConfig?.readonly ?? false"
//                 [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
//                 [attr.aria-label]="params.colDef?.headerName">
//         </p-knob>
//       </div>

//       <div *ngSwitchCase="'multiselect'" class="w-full">
//         <p-multiselect [id]="params.colDef?.field + '-' + params.node.rowIndex" [(ngModel)]="value" [options]="options"
//                        [optionLabel]="inputConfig?.optionLabel ?? null" [optionValue]="inputConfig?.optionValue ?? null"
//                        [placeholder]="inputConfig?.placeholder ?? 'Select'"
//                        [maxSelectedLabels]="inputConfig?.maxSelectedLabels ?? null" [display]="inputConfig?.display ?? 'comma'"
//                        [filter]="inputConfig?.filter ?? false" [styleClass]="inputConfig?.styleClass ?? 'w-full'" appendTo="body"
//                        [disabled]="!isEditing()" [readonly]="inputConfig?.readonly ?? false"
//                        [pTooltip]="inputConfig?.tooltip ?? null" [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'"
//                        [attr.aria-label]="params.colDef?.headerName">
//         </p-multiselect>
//       </div>

//       <input *ngSwitchDefault pInputText [id]="params.colDef?.field + '-' + params.node.rowIndex"
//              class="w-full p-inputtext-sm" [(ngModel)]="value" (ngModelChange)="onValueChange($event)"
//              [placeholder]="inputConfig?.placeholder ?? ''" [disabled]="!isEditing()"
//              [readonly]="inputConfig?.readonly ?? false" [pTooltip]="inputConfig?.tooltip ?? null"
//              [tooltipPosition]="inputConfig?.tooltipPosition ?? 'top'" [attr.aria-label]="params.colDef?.headerName" />
//     </div>
//   `,
//   styles: [`
//     .dynamic-cell-container {
//       display: flex;
//       align-items: center;
//       justify-content: flex-start;
//       height: 100%;
//     }
//   `]
// })
// export class DynamicCellComponent implements ICellRendererAngularComp, ICellEditorAngularComp {
//   @Output() actionTriggered = new EventEmitter<{ action: 'edit' | 'save' | 'cancel' | 'delete', rowData: any }>();

//   params!: ICellRendererParams | ICellEditorParams;
//   value: any;
//   type: string = 'text';
//   options: any[] = [];
//   inputConfig: any = {};
//   label: string | undefined;
//   private valueChangedCallback: ValueChangedCallback | undefined;
//   private context!: GridContext;

//   // Cell Renderer Methods
//   agInit(params: ICellRendererParams): void {
//     this.init(params);
//   }

//   refresh(params: ICellRendererParams): boolean {
//     this.init(params);
//     return true;
//   }

//   // Cell Editor Methods
//   getGui(): HTMLElement {
//     return this.params.eGridCell.querySelector('.dynamic-cell-container') as HTMLElement;
//   }

//   afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
//     // Focus the first input element
//     const input = this.getGui().querySelector('input, p-inputNumber, p-select, p-datepicker') as HTMLElement;
//     if (input) {
//       input.focus();
//     }
//   }

//   getValue(): any {
//     return this.value;
//   }

//   isPopup(): boolean {
//     return false;
//   }

//   // Shared Initialization
//   private init(params: ICellRendererParams | ICellEditorParams): void {
//     this.params = params;
//     this.value = params.value;
//     this.context = params.context as GridContext;
//     console.log('DynamicCell init:', this.params.data?._id, 'Context:', this.context, 'Is Editor:', 'getValue' in params);

//     const cellParams = params?.colDef?.cellRendererParams || params?.colDef?.cellEditorParams || {};
//     this.type = cellParams.type || 'text';
//     this.options = cellParams.options || [];
//     this.inputConfig = cellParams.inputConfig || {};
//     this.label = cellParams.label;
//     this.valueChangedCallback = cellParams.valueChangedCallback;
//   }

//   isEditing(): boolean {
//     const isEditing = this.context?.isRowEditing(this.params.data?._id) ?? false;
//     console.log('DynamicCell isEditing:', isEditing, 'Row ID:', this.params.data?._id);
//     return isEditing;
//   }

//   onValueChange(newValue: any, originalEvent?: any): void {
//     const oldValue = this.value;
//     if (newValue === oldValue) return;

//     this.value = newValue;
//     if ('setValue' in this.params) {
//       this.params.setValue?.(newValue);
//     }

//     if (this.valueChangedCallback) {
//       const eventData: CellChangedEvent = {
//         oldValue,
//         newValue,
//         field: this.params.colDef?.field!,
//         data: this.params.data,
//         node: this.params.node,
//         colDef: this.params.colDef,
//         event: originalEvent || newValue,
//       };
//       this.valueChangedCallback(eventData);
//     }
//   }

//   preventE(event: KeyboardEvent): void {
//     if (['e', 'E', '+', '-'].includes(event.key) && !this.inputConfig?.allowScientificNotation) {
//       event.preventDefault();
//     }
//   }
// }

// // import { Component, EventEmitter, Output } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { ICellRendererAngularComp } from 'ag-grid-angular';
// // import { ICellRendererParams } from 'ag-grid-community';
// // import { InputTextModule } from 'primeng/inputtext';
// // import { InputNumberModule } from 'primeng/inputnumber';
// // import { DropdownModule } from 'primeng/dropdown';
// // import { ColorPickerModule } from 'primeng/colorpicker';
// // import { TooltipModule } from 'primeng/tooltip';
// // import { CascadeSelectModule } from 'primeng/cascadeselect';
// // import { AutoCompleteModule } from 'primeng/autocomplete';
// // import { CheckboxModule } from 'primeng/checkbox';
// // import { DatePickerModule } from 'primeng/datepicker';
// // import { InputMaskModule } from 'primeng/inputmask';
// // import { KeyFilterModule } from 'primeng/keyfilter';
// // import { KnobModule } from 'primeng/knob';
// // import { MultiSelectModule } from 'primeng/multiselect';
// // import { SelectModule } from 'primeng/select';

// // // Interface for the cell changed event
// // export interface CellChangedEvent {
// //   oldValue: any;
// //   newValue: any;
// //   field: string;
// //   data: any;
// //   node: any;
// //   colDef: any;
// //   event?: any;
// // }

// // type ValueChangedCallback = (eventData: CellChangedEvent) => void;

// // @Component({
// //   selector: 'app-dynamic-cell',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     FormsModule,
// //     InputTextModule,
// //     InputNumberModule,
// //     DropdownModule,
// //     ColorPickerModule,
// //     TooltipModule,
// //     CascadeSelectModule,
// //     AutoCompleteModule,
// //     CheckboxModule,
// //     DatePickerModule,
// //     InputMaskModule,
// //     KeyFilterModule,
// //     KnobModule,
// //     MultiSelectModule,
// //     SelectModule,
// //   ],

// // templateUrl: './dynamic-cell.component.html',
// // styleUrls: ['./dynamic-cell.component.css'] // Use styleUrls (plural)
// // })
// // export class DynamicCellComponent implements ICellRendererAngularComp {
// //   @Output() actionTriggered = new EventEmitter<{ action: 'edit' | 'save' | 'cancel' | 'delete', rowData: any }>();

// //   params!: ICellRendererParams;
// //   value: any;
// //   type: string = 'text';
// //   options: any[] = [];
// //   inputConfig: any = {};
// //   label: string | undefined;
// //   private valueChangedCallback: ValueChangedCallback | undefined;
// //   private context!: GridContext;

// //   agInit(params: ICellRendererParams): void {
// //     this.params = params;
// //     this.value = params.value;
// //     this.context = params.context as GridContext;

// //     const cellParams = params?.colDef?.cellRendererParams || {};
// //     this.type = cellParams.type || 'text';
// //     this.options = cellParams.options || [];
// //     this.inputConfig = cellParams.inputConfig || {};
// //     this.label = cellParams.label;
// //     this.valueChangedCallback = cellParams.valueChangedCallback;
// //   }

// //   isEditing(): boolean {
// //     return this.context?.isRowEditing(this.params.data?._id) ?? false;
// //   }

// //   refresh(params: ICellRendererParams): boolean {
// //     this.params = params;
// //     this.value = params.value;
// //     const cellParams = params.colDef?.cellRendererParams || {};
// //     this.type = cellParams.type || 'text';
// //     this.options = cellParams.options || [];
// //     this.inputConfig = cellParams.inputConfig || {};
// //     this.label = cellParams.label;
// //     this.valueChangedCallback = cellParams.valueChangedCallback;
// //     return true;
// //   }

// //   onValueChange(newValue: any, originalEvent?: any): void {
// //     const oldValue = this.value;
// //     if (newValue === oldValue) return;

// //     this.value = newValue;
// //     this.params.setValue?.(newValue);

// //     if (this.valueChangedCallback) {
// //       const eventData: CellChangedEvent = {
// //         oldValue,
// //         newValue,
// //         field: this.params.colDef?.field!,
// //         data: this.params.data,
// //         node: this.params.node,
// //         colDef: this.params.colDef,
// //         event: originalEvent || newValue,
// //       };
// //       this.valueChangedCallback(eventData);
// //     }
// //   }

// //   preventE(event: KeyboardEvent): void {
// //     if (['e', 'E', '+', '-'].includes(event.key) && !this.inputConfig?.allowScientificNotation) {
// //       event.preventDefault();
// //     }
// //   }
// // }