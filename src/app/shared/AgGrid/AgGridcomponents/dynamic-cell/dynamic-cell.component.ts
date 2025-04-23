// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-dynamic-cell',
// //   imports: [],
// //   templateUrl: './dynamic-cell.component.html',
// //   styleUrl: './dynamic-cell.component.css'
// // })
// // export class DynamicCellComponent {

// // }




// import { Component, Input } from "@angular/core";
// import { ICellRendererAngularComp } from "ag-grid-angular";
// import { ICellRendererParams } from "ag-grid-community";
// import { InputNumberModule } from 'primeng/inputnumber';
// import { InputTextModule } from 'primeng/inputtext';
// import { SelectModule } from 'primeng/select';
// import { FormsModule } from "@angular/forms";
// import { CommonModule } from "@angular/common";
// @Component({
//   selector: 'app-dynamic-cell',
//   imports: [InputNumberModule, CommonModule, FormsModule, SelectModule, InputTextModule],
//   templateUrl: './dynamic-cell.component.html',
//   styleUrl: './dynamic-cell.component.css'
// })
// export class DynamicCellComponent implements ICellRendererAngularComp {
//   refresh(params: ICellRendererParams<any, any, any>): boolean {
//     throw new Error("Method not implemented.");
//   }
//   @Input() params: any;
//   @Input() type: string | undefined;  // The column type (text, number, date)
//   @Input() data: any;     // The row data
//   @Input() key: string | undefined;   
//   value: any;

//   agInit(params: any): void {
//     this.params = params;
//     this.value = params.value;
//     this.type = params.colDef.cellRendererParams?.type || 'text';
//     console.log(this.params, this.value, this.type);
//   }

//   isEditing(): boolean {
//     return this.params.context?.componentParent?.isRowEditing(this.params.node);
//   }

//   onValueChange(newValue: any) {
//     this.value = newValue;
//     this.params.data[this.params.colDef.field] = newValue;
//   }
// }
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

// Ag-Grid Imports
import { ICellRendererAngularComp } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown'; // Correct module for p-dropdown
import { ColorPickerModule } from 'primeng/colorpicker';
import { TooltipModule } from 'primeng/tooltip';
/**
 * Interface for the structured data passed to the callback on value change.
 */
export interface CellChangedEvent {
    oldValue: any;
    newValue: any;
    field: string; // The column field name being changed
    data: any;     // The complete row data
    node: any;     // The Ag-Grid row node
    colDef: any;   // The column definition
    event?: any;   // The original browser event, if applicable
}

/**
 * Type definition for the callback function expected in cellRendererParams.
 * This function will be called by the cell component when its value changes.
 */
type ValueChangedCallback = (eventData: CellChangedEvent) => void;

@Component({
    selector: 'app-dynamic-cell',
    standalone: true, // Recommended for modern Angular
    imports: [
        // Angular Modules
        CommonModule,
        FormsModule,

        // PrimeNG Modules
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        ColorPickerModule,TooltipModule,
    ],
    templateUrl: './dynamic-cell.component.html',
    styleUrls: ['./dynamic-cell.component.css'] // Use styleUrls (plural)
})
export class DynamicCellComponent implements ICellRendererAngularComp {

    // Properties managed by Ag-Grid
    params!: ICellRendererParams; // Definite assignment assertion

    // Component State
    value: any; // The current value of the input

    // Configuration from cellRendererParams
    type: string = 'text';       // Type of PrimeNG component to render
    options: any[] = [];         // Options for dropdown
    inputConfig: any = {};       // Generic config object for PrimeNG props
    label: string | undefined;   // Optional label (e.g., for color picker)

    // Callback function provided by the parent grid component
    private valueChangedCallback: ValueChangedCallback | undefined;

    /**
     * Ag-Grid initialization method. Called once when the component is created.
     */
    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = params.value; // Set initial value from grid data

        // Safely extract configuration from cellRendererParams
        const cellParams = params?.colDef?.cellRendererParams || {};
        this.type = cellParams.type || 'text';
        this.options = cellParams.options || [];
        this.inputConfig = cellParams.inputConfig || {};
        this.label = cellParams.label; // Optional label

        // Store the callback function if provided
        this.valueChangedCallback = cellParams.valueChangedCallback;

        // console.log("DynamicCell Initialized:", { params: this.params, value: this.value, type: this.type, config: this.inputConfig });
    }

    /**
     * Ag-Grid refresh method. Called when grid data changes.
     * Return true to handle the refresh internally, false to recreate the component.
     */
    refresh(params: ICellRendererParams): boolean {
        // Update params and value
        this.params = params;
        this.value = params.value;

        // Re-read configuration in case it changed (less common, but possible)
        const cellParams = params.colDef?.cellRendererParams || {};
        this.type = cellParams.type || 'text';
        this.options = cellParams.options || [];
        this.inputConfig = cellParams.inputConfig || {};
        this.label = cellParams.label;
        this.valueChangedCallback = cellParams.valueChangedCallback; // Update callback reference

        // Returning true tells Ag-Grid we've handled the refresh
        return true;
    }

    /**
     * Central handler for value changes from any PrimeNG input.
     * Updates the grid data and triggers the callback.
     */
    onValueChange(newValue: any, originalEvent?: any): void {
        const oldValue = this.value;

        // Prevent unnecessary updates if the value hasn't actually changed
        if (newValue === oldValue) {
            return;
        }

        this.value = newValue; // Update local component state

        // --- Safely update Ag-Grid's data model ---
        // Use optional chaining (?.) because setValue might not exist if not editable
        this.params.setValue?.(newValue);
        // ---------------------------------------------

        // If a callback function was provided via params, call it
        if (this.valueChangedCallback) {
            const eventData: CellChangedEvent = {
                oldValue: oldValue,
                newValue: newValue,
                field: this.params.colDef?.field!, // Use non-null assertion if field is guaranteed
                data: this.params.data,
                node: this.params.node,
                colDef: this.params.colDef,
                event: originalEvent // Include original event for context
            };
            this.valueChangedCallback(eventData);
        }
    }

    // --- Specific handlers to correctly extract values from PrimeNG component events ---

    handleTextChange(value: string | null, event?: any): void {
        this.onValueChange(value, event);
    }

    handleNumberChange(event: any): void {
        // p-inputNumber's onInput event provides value in event.value
        this.onValueChange(event.value, event.originalEvent);
    }

    handleDropdownChange(event: { originalEvent: Event, value: any }): void {
        // p-dropdown's onChange event provides value in event.value
        this.onValueChange(event.value, event.originalEvent);
    }

    handleColorChange(value: string | null, event?: any): void {
        // p-colorPicker's ngModelChange passes the value directly
        this.onValueChange(value, event);
    }

    /**
     * Example utility: Prevents non-numeric keys in number inputs.
     * (Based on your original code snippet)
     */
    preventE(event: KeyboardEvent): void {
        // Prevent 'e', 'E', '+', '-' which are sometimes allowed in type="number"
        // Adjust the keys based on your specific requirements
        if (['e', 'E', '+', '-'].includes(event.key) && !this.inputConfig?.allowScientificNotation) {
             event.preventDefault();
        }
    }

     // Optional: If you need specific keyup logic beyond just value change
    // textBoxKeyUpEvent(field: string, event: KeyboardEvent) {
    //   console.log(`Key up on field ${field}`, event.key);
    //   // Potentially emit a different event or call another callback
    // }
}