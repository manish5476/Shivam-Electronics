import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// --- Your App's Modules & Components ---
import { ImageUploaderComponent } from '../image-uploader.component';
import { NoteService } from '../../../core/services/notes.service';

// --- PrimeNG Modules for UI ---
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ImageModule } from 'primeng/image';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs'; // IMPORT the specific event type

// --- Define Interfaces and Types ---
interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  attachments: string[];
  createdAt: string;
}

interface CalendarDay {
  date: Date;
}

type LoadingKey = 'day' | 'week' | 'month' | 'year';
type SummaryKey = 'week' | 'month' | 'year';

interface Summary {
  title: string;
  key: SummaryKey;
  data: Note[];
  icon: string;
}

@Component({
  selector: 'app-notes-manager',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ImageUploaderComponent,
    ButtonModule, InputTextModule, TextareaModule, AutoCompleteModule,
    ToastModule, ProgressSpinnerModule, TooltipModule,
    ImageModule, ConfirmDialogModule, TabsModule
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notes-manager.component.html',
  styleUrls: ['./notes-manager.component.css']
})
export class NotesManagerComponent implements OnInit, OnChanges {
  // --- Injected Services ---
  private noteService = inject(NoteService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private confirmationService = inject(ConfirmationService);

  @Input() date!: CalendarDay;

  // --- Component State ---
  dailyNotes: Note[] = [];
  filteredDailyNotes: Note[] = [];
  summaries: Summary[] = [];
  selectedNote: Note | any
  noteForm: FormGroup;
  searchControl = new FormControl('');
  isEditing = false;
  isSaving = false;
  isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
  activeTabValue: LoadingKey = 'day';
  private loadedTabs: { [key in SummaryKey]: boolean } = { week: false, month: false, year: false };
  private _noteToSelectAfterLoad: string | null = null;

  constructor() {
    this.noteForm = this.fb.group({
      _id: [null],
      title: ['', Validators.required],
      content: ['', Validators.required],
      tags: [[]],
      attachments: [[]],
      createdAt: [null]
    });
  }

  ngOnInit(): void {
    this.summaries = [
      { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
      { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar' },
      { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
    ];
    this.setupSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date']?.currentValue && !this._noteToSelectAfterLoad) {
      this.activeTabValue = 'day';
      this.resetAllNotes();
      this.loadDailyNotes();
    }
  }

  trackNoteById(index: number, note: Note): string {
    return note._id;
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      const term = (searchTerm || '').toLowerCase();
      this.filteredDailyNotes = !term
        ? this.dailyNotes
        : this.dailyNotes.filter(n =>
            n.title.toLowerCase().includes(term) ||
            n.content.toLowerCase().includes(term)
          );
      this.cdr.markForCheck();
    });
  }

  private createDataHandler<T extends { data: { notes: Note[] } }>(callback: (res: T) => void) {
    return {
      next: (res: T) => {
        callback(res);
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
      }
    };
  }
  
  private updateLoadingState(key: LoadingKey, value: boolean): void {
    this.isLoading[key] = value;
    this.cdr.markForCheck();
  }

  loadDailyNotes(): void {
    if (!this.date?.date) return;
    this.updateLoadingState('day', true);
    if (!this._noteToSelectAfterLoad) {
      this.startNewNote();
    }
    this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
      .pipe(finalize(() => this.updateLoadingState('day', false)))
      .subscribe(this.createDataHandler(res => {
        this.dailyNotes = this.sortNotes(res.data.notes || []);
        this.filteredDailyNotes = this.dailyNotes;
        if (this._noteToSelectAfterLoad) {
          const noteToEdit = this.dailyNotes.find(n => n._id === this._noteToSelectAfterLoad);
          if (noteToEdit) {
            this.selectNote(noteToEdit);
          }
          this._noteToSelectAfterLoad = null;
        }
      }));
  }

  loadWeeklyNotes(): void {
    if (!this.date?.date) return;
    this.updateLoadingState('week', true);
    this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
      .pipe(finalize(() => this.updateLoadingState('week', false)))
      .subscribe(this.createDataHandler(res => {
        this.summaries[0].data = this.sortNotes(res.data.notes || []);
        this.loadedTabs.week = true;
      }));
  }

  loadMonthlyNotes(): void {
    if (!this.date?.date) return;
    this.updateLoadingState('month', true);
    const d = this.date.date;
    this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
      .pipe(finalize(() => this.updateLoadingState('month', false)))
      .subscribe(this.createDataHandler(res => {
        this.summaries[1].data = this.sortNotes(res.data.notes || []);
        this.loadedTabs.month = true;
      }));
  }

  loadYearlyNotes(): void {
    if (!this.date?.date) return;
    this.updateLoadingState('year', true);
    this.noteService.getNotes({ year: this.date.date.getFullYear() })
      .pipe(finalize(() => this.updateLoadingState('year', false)))
      .subscribe(this.createDataHandler(res => {
        this.summaries[2].data = this.sortNotes(res.data.notes || []);
        this.loadedTabs.year = true;
      }));
  }

  refreshCurrentView(): void {
    const actions: { [key in LoadingKey]: () => void } = {
      day: () => this.loadDailyNotes(),
      week: () => this.loadWeeklyNotes(),
      month: () => this.loadMonthlyNotes(),
      year: () => this.loadYearlyNotes(),
    };
    actions[this.activeTabValue]();
  }
  
  /**
   * CORRECTED: Use the specific TabsChangeEvent type for the event parameter.
   */
  onTabChange(event: any): void {
    console.log(event);
    this.activeTabValue = event.value as LoadingKey;
    this.selectedNote = null;
    if (this.activeTabValue !== 'day') {
      const summary = this.summaries.find(s => s.key === this.activeTabValue);
      if (summary && !this.loadedTabs[summary.key]) {
        this.refreshCurrentView();
      }
    }
  }

  selectNote(note: Note): void {
    this.selectedNote = note;
    this.isEditing = true;
    this.noteForm.reset(note);
    this.isEditable(note) ? this.noteForm.enable() : this.noteForm.disable();
  }

  selectForPreview(note: Note): void {
    this.selectedNote = note;
  }

  startNewNote(): void {
    this.selectedNote = null;
    this.isEditing = false;
    this.noteForm.enable();
    this.noteForm.reset({
      createdAt: this.date ? this.date.date : new Date(),
      tags: [],
      attachments: []
    });
  }

  saveNote(): void {
    if (this.noteForm.invalid) return;
    this.isSaving = true;
    const formData = this.noteForm.getRawValue();
    const operation = this.isEditing
      ? this.noteService.updateNote(formData._id, formData)
      : this.noteService.createNote({ ...formData, createdAt: this.date.date });

    operation.pipe(finalize(() => {
      this.isSaving = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
        this.refreshCurrentView();
        if (res.data.note) {
          this.selectNote(res.data.note);
        }
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
    });
  }

  deleteNote(note: Note | null, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (!note || !this.isEditable(note)) {
        this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'This note is too old to be deleted.' });
        return;
    }
    
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this note?',
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.noteService.deleteNote(note._id).subscribe({
              next: () => {
                this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
                this.selectedNote = null;
                this.refreshCurrentView();
              },
              error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
            });
        }
    });
  }

  editNoteFromPreview(note: Note | null): void {
    if (!note) return;
    this.date = { date: new Date(note.createdAt) };
    this._noteToSelectAfterLoad = note._id;
    this.activeTabValue = 'day';
    this.loadDailyNotes();
    this.cdr.markForCheck();
  }

  onImageUploaded(url: string): void {
    const attachments = this.noteForm.get('attachments')?.value || [];
    this.noteForm.get('attachments')?.setValue([...attachments, url]);
  }

  removeAttachment(index: number): void {
    const attachments = [...this.noteForm.get('attachments')?.value || []];
    attachments.splice(index, 1);
    this.noteForm.get('attachments')?.setValue(attachments);
  }

  private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

  isEditable(note: Note | null): boolean {
    if (!note?.createdAt) return false;
    const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
    return new Date(note.createdAt).getTime() > twentyFourHoursAgo;
  }

  private sortNotes(notes: Note[]): Note[] {
    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private resetAllNotes(): void {
    this.dailyNotes = [];
    this.filteredDailyNotes = [];
    this.summaries.forEach(s => s.data = []);
    this.loadedTabs = { week: false, month: false, year: false };
    this.startNewNote();
  }
}



// import {
//   Component,
//   Input,
//   OnInit,
//   OnChanges,
//   SimpleChanges,
//   inject,
//   ChangeDetectionStrategy,
//   ChangeDetectorRef
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// // --- Your App's Modules & Components ---
// import { ImageUploaderComponent } from '../image-uploader.component';
// import { NoteService } from '../../../core/services/notes.service';

// // --- PrimeNG Modules for UI ---
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { TextareaModule } from 'primeng/textarea';
// import { AutoCompleteModule } from 'primeng/autocomplete'; // REPLACES ChipsModule
// import { ToastModule } from 'primeng/toast';
// import { MessageService, ConfirmationService } from 'primeng/api';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { TooltipModule } from 'primeng/tooltip';
// import { ImageModule } from 'primeng/image';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { TabsModule } from 'primeng/tabs'; // REPLACES TabViewModule

// // --- Define Interfaces and Types ---
// interface Note {
//   _id: string;
//   title: string;
//   content: string;
//   tags: string[];
//   attachments: string[];
//   createdAt: string;
// }

// interface CalendarDay {
//   date: Date;
// }

// type LoadingKey = 'day' | 'week' | 'month' | 'year';
// type SummaryKey = 'week' | 'month' | 'year';

// interface Summary {
//   title: string;
//   key: SummaryKey;
//   data: Note[];
//   icon: string;
// }

// @Component({
//   selector: 'app-notes-manager',
//   standalone: true,
//   imports: [
//     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
//     ButtonModule, InputTextModule, TextareaModule, AutoCompleteModule,
//     ToastModule, ProgressSpinnerModule, TooltipModule,
//     ImageModule, ConfirmDialogModule, TabsModule
//   ],
//   providers: [MessageService, ConfirmationService],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   templateUrl: './notes-manager.component.html',
//   styleUrls: ['./notes-manager.component.css']
// })
// export class NotesManagerComponent implements OnInit, OnChanges {
//   // --- Injected Services ---
//   private noteService = inject(NoteService);
//   private fb = inject(FormBuilder);
//   private messageService = inject(MessageService);
//   private cdr = inject(ChangeDetectorRef);
//   private confirmationService = inject(ConfirmationService);

//   @Input() date!: CalendarDay;

//   // --- Component State ---
//   dailyNotes: Note[] = [];
//   filteredDailyNotes: Note[] = [];
//   summaries: Summary[] = [];
//   selectedNote: Note | any
//   noteForm: FormGroup;
//   searchControl = new FormControl('');
//   isEditing = false;
//   isSaving = false;
//   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
//   activeTabValue: LoadingKey = 'day';
//   private loadedTabs: { [key in SummaryKey]: boolean } = { week: false, month: false, year: false };
//   private _noteToSelectAfterLoad: string | null = null;

//   constructor() {
//     this.noteForm = this.fb.group({
//       _id: [null],
//       title: ['', Validators.required],
//       content: ['', Validators.required],
//       tags: [[]],
//       attachments: [[]],
//       createdAt: [null]
//     });
//   }

//   ngOnInit(): void {
//     this.summaries = [
//       { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
//       { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar' },
//       { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
//     ];
//     this.setupSearch();
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['date']?.currentValue && !this._noteToSelectAfterLoad) {
//       this.activeTabValue = 'day';
//       this.resetAllNotes();
//       this.loadDailyNotes();
//     }
//   }

//   trackNoteById(index: number, note: Note): string {
//     return note._id;
//   }

//   private setupSearch(): void {
//     this.searchControl.valueChanges.pipe(
//       debounceTime(300),
//       distinctUntilChanged()
//     ).subscribe(searchTerm => {
//       const term = (searchTerm || '').toLowerCase();
//       this.filteredDailyNotes = !term
//         ? this.dailyNotes
//         : this.dailyNotes.filter(n =>
//             n.title.toLowerCase().includes(term) ||
//             n.content.toLowerCase().includes(term)
//           );
//       this.cdr.markForCheck();
//     });
//   }

//   private createDataHandler<T extends { data: { notes: Note[] } }>(callback: (res: T) => void) {
//     return {
//       next: (res: T) => {
//         callback(res);
//       },
//       error: (err: any) => {
//         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
//       }
//     };
//   }
  
//   private updateLoadingState(key: LoadingKey, value: boolean): void {
//     this.isLoading[key] = value;
//     this.cdr.markForCheck();
//   }

//   loadDailyNotes(): void {
//     if (!this.date?.date) return;
//     this.updateLoadingState('day', true);
//     if (!this._noteToSelectAfterLoad) {
//       this.startNewNote();
//     }
//     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
//       .pipe(finalize(() => this.updateLoadingState('day', false)))
//       .subscribe(this.createDataHandler(res => {
//         this.dailyNotes = this.sortNotes(res.data.notes || []);
//         this.filteredDailyNotes = this.dailyNotes;
//         if (this._noteToSelectAfterLoad) {
//           const noteToEdit = this.dailyNotes.find(n => n._id === this._noteToSelectAfterLoad);
//           if (noteToEdit) {
//             this.selectNote(noteToEdit);
//           }
//           this._noteToSelectAfterLoad = null;
//         }
//       }));
//   }

//   loadWeeklyNotes(): void {
//     if (!this.date?.date) return;
//     this.updateLoadingState('week', true);
//     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
//       .pipe(finalize(() => this.updateLoadingState('week', false)))
//       .subscribe(this.createDataHandler(res => {
//         this.summaries[0].data = this.sortNotes(res.data.notes || []);
//         this.loadedTabs.week = true;
//       }));
//   }

//   loadMonthlyNotes(): void {
//     if (!this.date?.date) return;
//     this.updateLoadingState('month', true);
//     const d = this.date.date;
//     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
//       .pipe(finalize(() => this.updateLoadingState('month', false)))
//       .subscribe(this.createDataHandler(res => {
//         this.summaries[1].data = this.sortNotes(res.data.notes || []);
//         this.loadedTabs.month = true;
//       }));
//   }

//   loadYearlyNotes(): void {
//     if (!this.date?.date) return;
//     this.updateLoadingState('year', true);
//     this.noteService.getNotes({ year: this.date.date.getFullYear() })
//       .pipe(finalize(() => this.updateLoadingState('year', false)))
//       .subscribe(this.createDataHandler(res => {
//         this.summaries[2].data = this.sortNotes(res.data.notes || []);
//         this.loadedTabs.year = true;
//       }));
//   }

//   refreshCurrentView(): void {
//     const actions: { [key in LoadingKey]: () => void } = {
//       day: () => this.loadDailyNotes(),
//       week: () => this.loadWeeklyNotes(),
//       month: () => this.loadMonthlyNotes(),
//       year: () => this.loadYearlyNotes(),
//     };
//     actions[this.activeTabValue]();
//   }
  
//   onTabChange(event: any): void {
//     this.activeTabValue = event.value;
//     this.selectedNote = null;
//     if (this.activeTabValue !== 'day') {
//       const summary = this.summaries.find(s => s.key === this.activeTabValue);
//       if (summary && !this.loadedTabs[summary.key]) {
//         this.refreshCurrentView();
//       }
//     }
//   }

//   selectNote(note: Note): void {
//     this.selectedNote = note;
//     this.isEditing = true;
//     this.noteForm.reset(note);
//     this.isEditable(note) ? this.noteForm.enable() : this.noteForm.disable();
//   }

//   selectForPreview(note: Note): void {
//     this.selectedNote = note;
//   }

//   startNewNote(): void {
//     this.selectedNote = null;
//     this.isEditing = false;
//     this.noteForm.enable();
//     this.noteForm.reset({
//       createdAt: this.date ? this.date.date : new Date(),
//       tags: [],
//       attachments: []
//     });
//   }

//   saveNote(): void {
//     if (this.noteForm.invalid) return;
//     this.isSaving = true;
//     const formData = this.noteForm.getRawValue();
//     const operation = this.isEditing
//       ? this.noteService.updateNote(formData._id, formData)
//       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

//     operation.pipe(finalize(() => {
//       this.isSaving = false;
//       this.cdr.markForCheck();
//     })).subscribe({
//       next: (res: any) => {
//         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
//         this.refreshCurrentView(); // Refresh current view in case we edited from a summary tab
//         if (res.data.note) {
//           this.selectNote(res.data.note);
//         }
//       },
//       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
//     });
//   }

//   deleteNote(note: Note | null, event?: MouseEvent): void {
//     if (event) event.stopPropagation();
//     if (!note || !this.isEditable(note)) {
//         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'This note is too old to be deleted.' });
//         return;
//     }
    
//     this.confirmationService.confirm({
//         message: 'Are you sure you want to delete this note?',
//         header: 'Delete Confirmation',
//         icon: 'pi pi-exclamation-triangle',
//         accept: () => {
//             this.noteService.deleteNote(note._id).subscribe({
//               next: () => {
//                 this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
//                 this.selectedNote = null;
//                 this.refreshCurrentView();
//               },
//               error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
//             });
//         }
//     });
//   }

//   editNoteFromPreview(note: Note | null): void {
//     if (!note) return;
//     this.date = { date: new Date(note.createdAt) };
//     this._noteToSelectAfterLoad = note._id;
//     this.activeTabValue = 'day';
//     this.loadDailyNotes(); // Explicitly call load, don't rely on ngOnChanges
//     this.cdr.markForCheck();
//   }

//   onImageUploaded(url: string): void {
//     const attachments = this.noteForm.get('attachments')?.value || [];
//     this.noteForm.get('attachments')?.setValue([...attachments, url]);
//   }

//   removeAttachment(index: number): void {
//     const attachments = [...this.noteForm.get('attachments')?.value || []];
//     attachments.splice(index, 1);
//     this.noteForm.get('attachments')?.setValue(attachments);
//   }

//   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

//   isEditable(note: Note | null): boolean {
//     if (!note?.createdAt) return false;
//     const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
//     return new Date(note.createdAt).getTime() > twentyFourHoursAgo;
//   }

//   private sortNotes(notes: Note[]): Note[] {
//     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   }

//   private resetAllNotes(): void {
//     this.dailyNotes = [];
//     this.filteredDailyNotes = [];
//     this.summaries.forEach(s => s.data = []);
//     this.loadedTabs = { week: false, month: false, year: false };
//     this.startNewNote();
//   }
// }



// // import {
// //   Component,
// //   Input,
// //   OnInit,
// //   OnChanges,
// //   SimpleChanges,
// //   inject,
// //   ChangeDetectionStrategy,
// //   ChangeDetectorRef
// // } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// // // --- Your App's Modules & Components ---
// // import { ImageUploaderComponent } from '../image-uploader.component';
// // import { NoteService } from '../../../core/services/notes.service';

// // // --- PrimeNG Modules for UI ---
// // import { ButtonModule } from 'primeng/button';
// // import { InputTextModule } from 'primeng/inputtext';
// // import { TextareaModule } from 'primeng/textarea';
// // import { AutoCompleteModule } from 'primeng/autocomplete'; // REPLACES ChipsModule
// // import { ToastModule } from 'primeng/toast';
// // import { MessageService, ConfirmationService } from 'primeng/api';
// // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // import { TooltipModule } from 'primeng/tooltip';
// // import { ImageModule } from 'primeng/image';
// // import { ConfirmDialogModule } from 'primeng/confirmdialog';
// // import { TabsModule } from 'primeng/tabs'; // REPLACES TabViewModule

// // // --- Define Interfaces and Types ---
// // interface Note {
// //   _id: string;
// //   title: string;
// //   content: string;
// //   tags: string[];
// //   attachments: string[];
// //   createdAt: string;
// // }

// // interface CalendarDay {
// //   date: Date;
// // }

// // type LoadingKey = 'day' | 'week' | 'month' | 'year';
// // type SummaryKey = 'week' | 'month' | 'year';

// // interface Summary {
// //   title: string;
// //   key: SummaryKey;
// //   data: Note[];
// //   icon: string;
// // }

// // @Component({
// //   selector: 'app-notes-manager',
// //   standalone: true,
// //   imports: [
// //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// //     ButtonModule, InputTextModule, TextareaModule, AutoCompleteModule,
// //     ToastModule, ProgressSpinnerModule, TooltipModule,
// //     ImageModule, ConfirmDialogModule, TabsModule
// //   ],
// //   providers: [MessageService, ConfirmationService],
// //   changeDetection: ChangeDetectionStrategy.OnPush,
// //   templateUrl: './notes-manager.component.html',
// //   styleUrls: ['./notes-manager.component.css']
// // })
// // export class NotesManagerComponent implements OnInit, OnChanges {
// //   // --- Injected Services ---
// //   private noteService = inject(NoteService);
// //   private fb = inject(FormBuilder);
// //   private messageService = inject(MessageService);
// //   private cdr = inject(ChangeDetectorRef);
// //   private confirmationService = inject(ConfirmationService);

// //   @Input() date!: CalendarDay;

// //   // --- Component State ---
// //   dailyNotes: Note[] = [];
// //   filteredDailyNotes: Note[] = [];
// //   summaries: Summary[] = [];
// //   selectedNote: any
// //   noteForm: FormGroup;
// //   searchControl = new FormControl('');
// //   isEditing = false;
// //   isSaving = false;
// //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// //   activeTabValue: LoadingKey = 'day'; // UPDATED: From activeIndex to string value
// //   private loadedTabs: { [key in SummaryKey]: boolean } = { week: false, month: false, year: false };
// //   private _noteToSelectAfterLoad: string | null = null;

// //   constructor() {
// //     this.noteForm = this.fb.group({
// //       _id: [null],
// //       title: ['', Validators.required],
// //       content: ['', Validators.required],
// //       tags: [[]],
// //       attachments: [[]],
// //       createdAt: [null]
// //     });
// //   }

// //   ngOnInit(): void {
// //     this.summaries = [
// //       { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// //       { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar' },
// //       { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// //     ];
// //     this.setupSearch();
// //   }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['date']?.currentValue) {
// //       this.activeTabValue = 'day';
// //       this.resetAllNotes();
// //       this.loadDailyNotes();
// //     }
// //   }

// //   trackNoteById(index: number, note: Note): string {
// //     return note._id;
// //   }

// //   private setupSearch(): void {
// //     this.searchControl.valueChanges.pipe(
// //       debounceTime(300),
// //       distinctUntilChanged()
// //     ).subscribe(searchTerm => {
// //       const term = (searchTerm || '').toLowerCase();
// //       this.filteredDailyNotes = !term
// //         ? this.dailyNotes
// //         : this.dailyNotes.filter(n =>
// //             n.title.toLowerCase().includes(term) ||
// //             n.content.toLowerCase().includes(term)
// //           );
// //       this.cdr.markForCheck();
// //     });
// //   }

// //   private createDataHandler<T extends { data: { notes: Note[] } }>(callback: (res: T) => void) {
// //     return {
// //       next: (res: T) => {
// //         callback(res);
// //       },
// //       error: (err: any) => {
// //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// //       }
// //     };
// //   }
  
// //   private updateLoadingState(key: LoadingKey, value: boolean): void {
// //     this.isLoading[key] = value;
// //     this.cdr.markForCheck();
// //   }

// //   loadDailyNotes(): void {
// //     if (!this.date?.date) return;
// //     this.updateLoadingState('day', true);
// //     if (!this._noteToSelectAfterLoad) {
// //       this.startNewNote();
// //     }
// //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// //       .pipe(finalize(() => this.updateLoadingState('day', false)))
// //       .subscribe(this.createDataHandler(res => {
// //         this.dailyNotes = this.sortNotes(res.data.notes || []);
// //         this.filteredDailyNotes = this.dailyNotes;
// //         if (this._noteToSelectAfterLoad) {
// //           const noteToEdit = this.dailyNotes.find(n => n._id === this._noteToSelectAfterLoad);
// //           if (noteToEdit) {
// //             this.selectNote(noteToEdit);
// //           }
// //           this._noteToSelectAfterLoad = null;
// //         }
// //       }));
// //   }

// //   loadWeeklyNotes(): void {
// //     if (!this.date?.date) return;
// //     this.updateLoadingState('week', true);
// //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// //       .pipe(finalize(() => this.updateLoadingState('week', false)))
// //       .subscribe(this.createDataHandler(res => {
// //         this.summaries[0].data = this.sortNotes(res.data.notes || []);
// //         this.loadedTabs.week = true;
// //       }));
// //   }

// //   loadMonthlyNotes(): void {
// //     if (!this.date?.date) return;
// //     this.updateLoadingState('month', true);
// //     const d = this.date.date;
// //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// //       .pipe(finalize(() => this.updateLoadingState('month', false)))
// //       .subscribe(this.createDataHandler(res => {
// //         this.summaries[1].data = this.sortNotes(res.data.notes || []);
// //         this.loadedTabs.month = true;
// //       }));
// //   }

// //   loadYearlyNotes(): void {
// //     if (!this.date?.date) return;
// //     this.updateLoadingState('year', true);
// //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// //       .pipe(finalize(() => this.updateLoadingState('year', false)))
// //       .subscribe(this.createDataHandler(res => {
// //         this.summaries[2].data = this.sortNotes(res.data.notes || []);
// //         this.loadedTabs.year = true;
// //       }));
// //   }

// //   refreshCurrentView(): void {
// //     const actions: { [key in LoadingKey]: () => void } = {
// //       day: () => this.loadDailyNotes(),
// //       week: () => this.loadWeeklyNotes(),
// //       month: () => this.loadMonthlyNotes(),
// //       year: () => this.loadYearlyNotes(),
// //     };
// //     actions[this.activeTabValue]();
// //   }
  
// //   onTabChange(event: any): void {
// //     this.activeTabValue = event.value;
// //     this.selectedNote = null;
// //     if (this.activeTabValue !== 'day') {
// //       const summary = this.summaries.find(s => s.key === this.activeTabValue);
// //       if (summary && !this.loadedTabs[summary.key]) {
// //         this.refreshCurrentView();
// //       }
// //     }
// //   }

// //   selectNote(note: Note): void {
// //     this.selectedNote = note;
// //     this.isEditing = true;
// //     this.noteForm.reset(note);
// //     this.isEditable(note) ? this.noteForm.enable() : this.noteForm.disable();
// //   }

// //   selectForPreview(note: Note): void {
// //     this.selectedNote = note;
// //   }

// //   startNewNote(): void {
// //     this.selectedNote = null;
// //     this.isEditing = false;
// //     this.noteForm.enable();
// //     this.noteForm.reset({
// //       createdAt: this.date ? this.date.date : new Date(),
// //       tags: [],
// //       attachments: []
// //     });
// //   }

// //   saveNote(): void {
// //     if (this.noteForm.invalid) return;
// //     this.isSaving = true;
// //     const formData = this.noteForm.getRawValue();
// //     const operation = this.isEditing
// //       ? this.noteService.updateNote(formData._id, formData)
// //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// //     operation.pipe(finalize(() => {
// //       this.isSaving = false;
// //       this.cdr.markForCheck();
// //     })).subscribe({
// //       next: (res: any) => {
// //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// //         this.loadDailyNotes();
// //         if (res.data.note) {
// //           this.selectNote(res.data.note);
// //         }
// //       },
// //       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// //     });
// //   }

// //   deleteNote(note: Note | null, event?: MouseEvent): void {
// //     if (event) event.stopPropagation();
// //     if (!note || !this.isEditable(note)) {
// //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'This note is too old to be deleted.' });
// //         return;
// //     }
    
// //     this.confirmationService.confirm({
// //         message: 'Are you sure you want to delete this note?',
// //         header: 'Delete Confirmation',
// //         icon: 'pi pi-exclamation-triangle',
// //         accept: () => {
// //             this.noteService.deleteNote(note._id).subscribe({
// //               next: () => {
// //                 this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// //                 this.refreshCurrentView();
// //                 this.selectedNote = null;
// //               },
// //               error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// //             });
// //         }
// //     });
// //   }

// //   editNoteFromPreview(note: Note | null): void {
// //     if (!note) return;
// //     this.date = { date: new Date(note.createdAt) };
// //     this._noteToSelectAfterLoad = note._id;
// //     this.activeTabValue = 'day';
// //     this.cdr.markForCheck();
// //   }

// //   onImageUploaded(url: string): void {
// //     const attachments = this.noteForm.get('attachments')?.value || [];
// //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// //   }

// //   removeAttachment(index: number): void {
// //     const attachments = [...this.noteForm.get('attachments')?.value || []];
// //     attachments.splice(index, 1);
// //     this.noteForm.get('attachments')?.setValue(attachments);
// //   }

// //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

// //   isEditable(note: Note | null): boolean {
// //     if (!note?.createdAt) return false;
// //     const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
// //     return new Date(note.createdAt).getTime() > twentyFourHoursAgo;
// //   }

// //   private sortNotes(notes: Note[]): Note[] {
// //     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// //   }

// //   private resetAllNotes(): void {
// //     this.dailyNotes = [];
// //     this.filteredDailyNotes = [];
// //     this.summaries.forEach(s => s.data = []);
// //     this.loadedTabs = { week: false, month: false, year: false };
// //     this.startNewNote();
// //   }
// // }



// // // import {
// // //   Component,
// // //   Input,
// // //   OnInit,
// // //   OnChanges,
// // //   SimpleChanges,
// // //   inject,
// // //   ChangeDetectionStrategy,
// // //   ChangeDetectorRef
// // // } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// // // // --- Your App's Modules & Components ---
// // // import { ImageUploaderComponent } from '../image-uploader.component';
// // // import { NoteService } from '../../../core/services/notes.service';

// // // // --- PrimeNG Modules for UI ---
// // // import { ButtonModule } from 'primeng/button';
// // // import { InputTextModule } from 'primeng/inputtext';
// // // import { TextareaModule } from 'primeng/textarea';
// // // import { ChipsModule } from 'primeng/chips';
// // // import { ToastModule } from 'primeng/toast';
// // // import { MessageService, ConfirmationService } from 'primeng/api';
// // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // import { TabViewModule } from 'primeng/tabview';
// // // import { TooltipModule } from 'primeng/tooltip';
// // // import { ImageModule } from 'primeng/image'; // <-- IMPORTED: Fixes image visibility
// // // import { ConfirmDialogModule } from 'primeng/confirmdialog'; // <-- IMPORTED: For delete confirmation
// // // import { TabsModule } from 'primeng/tabs';
// // // // --- Define Interfaces and Types ---
// // // interface Note {
// // //   _id: string;
// // //   title: string;
// // //   content: string;
// // //   tags: string[];
// // //   attachments: string[];
// // //   createdAt: string;
// // // }

// // // interface CalendarDay {
// // //   date: Date;
// // // }

// // // type LoadingKey = 'day' | 'week' | 'month' | 'year';
// // // type SummaryKey = 'week' | 'month' | 'year';

// // // interface Summary {
// // //   title: string;
// // //   key: SummaryKey;
// // //   data: Note[];
// // //   icon: string;
// // // }

// // // @Component({
// // //   selector: 'app-notes-manager',
// // //   standalone: true,
// // //   imports: [
// // //     CommonModule, ReactiveFormsModule,TabsModule, ImageUploaderComponent,
// // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule,
// // //     ImageModule, ConfirmDialogModule // <-- ADDED MODULES
// // //   ],
// // //   providers: [MessageService, ConfirmationService], // <-- ADDED ConfirmationService
// // //   changeDetection: ChangeDetectionStrategy.OnPush,
// // //   templateUrl: './notes-manager.component.html',
// // //   styleUrls: ['./notes-manager.component.css']
// // // })
// // // export class NotesManagerComponent implements OnInit, OnChanges {
// // //   // --- Injected Services ---
// // //   private noteService = inject(NoteService);
// // //   private fb = inject(FormBuilder);
// // //   private messageService = inject(MessageService);
// // //   private cdr = inject(ChangeDetectorRef);
// // //   private confirmationService = inject(ConfirmationService); // <-- INJECTED Service

// // //   @Input() date!: CalendarDay;

// // //   // --- Component State ---
// // //   dailyNotes: Note[] = [];
// // //   filteredDailyNotes: Note[] = [];
// // //   summaries: Summary[] = [];
// // //   selectedNote: any
// // //   noteForm: FormGroup;
// // //   searchControl = new FormControl('');
// // //   isEditing = false;
// // //   isSaving = false;
// // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // //   activeTabIndex = 0;
// // //   private loadedTabs: { [key in SummaryKey]: boolean } = { week: false, month: false, year: false };
// // //   private _noteToSelectAfterLoad: string | null = null;

// // //   constructor() {
// // //     this.noteForm = this.fb.group({
// // //       _id: [null],
// // //       title: ['', Validators.required],
// // //       content: ['', Validators.required],
// // //       tags: [[]],
// // //       attachments: [[]],
// // //       createdAt: [null]
// // //     });
// // //   }

// // //   ngOnInit(): void {
// // //     this.summaries = [
// // //       { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // //       { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar' },
// // //       { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // //     ];
// // //     this.setupSearch();
// // //   }

// // //   ngOnChanges(changes: SimpleChanges): void {
// // //     if (changes['date']?.currentValue) {
// // //       this.activeTabIndex = 0;
// // //       this.resetAllNotes();
// // //       this.loadDailyNotes();
// // //     }
// // //   }

// // //   trackNoteById(index: number, note: Note): string {
// // //     return note._id;
// // //   }

// // //   private setupSearch(): void {
// // //     this.searchControl.valueChanges.pipe(
// // //       debounceTime(300),
// // //       distinctUntilChanged()
// // //     ).subscribe(searchTerm => {
// // //       const term = (searchTerm || '').toLowerCase();
// // //       this.filteredDailyNotes = !term
// // //         ? this.dailyNotes
// // //         : this.dailyNotes.filter(n =>
// // //             n.title.toLowerCase().includes(term) ||
// // //             n.content.toLowerCase().includes(term)
// // //           );
// // //       this.cdr.markForCheck();
// // //     });
// // //   }

// // //   private createDataHandler<T extends { data: { notes: Note[] } }>(callback: (res: T) => void) {
// // //     return {
// // //       next: (res: T) => {
// // //         callback(res);
// // //       },
// // //       error: (err: any) => {
// // //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// // //       }
// // //     };
// // //   }
  
// // //   private updateLoadingState(key: LoadingKey, value: boolean): void {
// // //     this.isLoading[key] = value;
// // //     this.cdr.markForCheck();
// // //   }

// // //   loadDailyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.updateLoadingState('day', true);
// // //     if (!this._noteToSelectAfterLoad) {
// // //       this.startNewNote();
// // //     }
// // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // //       .pipe(finalize(() => this.updateLoadingState('day', false)))
// // //       .subscribe(this.createDataHandler(res => {
// // //         this.dailyNotes = this.sortNotes(res.data.notes || []);
// // //         this.filteredDailyNotes = this.dailyNotes;
// // //         if (this._noteToSelectAfterLoad) {
// // //           const noteToEdit = this.dailyNotes.find(n => n._id === this._noteToSelectAfterLoad);
// // //           if (noteToEdit) {
// // //             this.selectNote(noteToEdit);
// // //           }
// // //           this._noteToSelectAfterLoad = null;
// // //         }
// // //       }));
// // //   }

// // //   loadWeeklyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.updateLoadingState('week', true);
// // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // //       .pipe(finalize(() => this.updateLoadingState('week', false)))
// // //       .subscribe(this.createDataHandler(res => {
// // //         this.summaries[0].data = this.sortNotes(res.data.notes || []);
// // //         this.loadedTabs.week = true;
// // //       }));
// // //   }

// // //   loadMonthlyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.updateLoadingState('month', true);
// // //     const d = this.date.date;
// // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // //       .pipe(finalize(() => this.updateLoadingState('month', false)))
// // //       .subscribe(this.createDataHandler(res => {
// // //         this.summaries[1].data = this.sortNotes(res.data.notes || []);
// // //         this.loadedTabs.month = true;
// // //       }));
// // //   }

// // //   loadYearlyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.updateLoadingState('year', true);
// // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // //       .pipe(finalize(() => this.updateLoadingState('year', false)))
// // //       .subscribe(this.createDataHandler(res => {
// // //         this.summaries[2].data = this.sortNotes(res.data.notes || []);
// // //         this.loadedTabs.year = true;
// // //       }));
// // //   }

// // //   refreshCurrentView(): void {
// // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // //     const actions: { [key in LoadingKey]: () => void } = {
// // //       day: () => this.loadDailyNotes(),
// // //       week: () => this.loadWeeklyNotes(),
// // //       month: () => this.loadMonthlyNotes(),
// // //       year: () => this.loadYearlyNotes(),
// // //     };
// // //     actions[tabKey]();
// // //   }
  
// // //   onTabChange(event:any): void {
// // //     this.activeTabIndex = event.index;
// // //     this.selectedNote = null;
// // //     if (this.activeTabIndex > 0) {
// // //       const summary = this.summaries[this.activeTabIndex - 1];
// // //       if (summary && !this.loadedTabs[summary.key]) {
// // //         this.refreshCurrentView();
// // //       }
// // //     }
// // //   }

// // //   selectNote(note: Note): void {
// // //     this.selectedNote = note;
// // //     this.isEditing = true;
// // //     this.noteForm.reset(note);
// // //     this.isEditable(note) ? this.noteForm.enable() : this.noteForm.disable();
// // //   }

// // //   selectForPreview(note: Note): void {
// // //     this.selectedNote = note;
// // //   }

// // //   startNewNote(): void {
// // //     this.selectedNote = null;
// // //     this.isEditing = false;
// // //     this.noteForm.enable();
// // //     this.noteForm.reset({
// // //       createdAt: this.date ? this.date.date : new Date(),
// // //       tags: [],
// // //       attachments: []
// // //     });
// // //   }

// // //   saveNote(): void {
// // //     if (this.noteForm.invalid) return;
// // //     this.isSaving = true;
// // //     const formData = this.noteForm.getRawValue();
// // //     const operation = this.isEditing
// // //       ? this.noteService.updateNote(formData._id, formData)
// // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // //     operation.pipe(finalize(() => {
// // //       this.isSaving = false;
// // //       this.cdr.markForCheck();
// // //     })).subscribe({
// // //       next: (res: any) => {
// // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // //         this.loadDailyNotes();
// // //         if (res.data.note) {
// // //           this.selectNote(res.data.note);
// // //         }
// // //       },
// // //       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // //     });
// // //   }

// // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // //     if (event) event.stopPropagation();
// // //     if (!note || !this.isEditable(note)) {
// // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'This note is too old to be deleted.' });
// // //         return;
// // //     }
    
// // //     // UPDATED: Use confirmation service
// // //     this.confirmationService.confirm({
// // //         message: 'Are you sure you want to delete this note?',
// // //         header: 'Delete Confirmation',
// // //         icon: 'pi pi-exclamation-triangle',
// // //         accept: () => {
// // //             this.noteService.deleteNote(note._id).subscribe({
// // //               next: () => {
// // //                 this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // //                 // If we are on a summary tab, refresh it. Otherwise, refresh daily notes.
// // //                 if(this.activeTabIndex > 0) {
// // //                   this.refreshCurrentView();
// // //                   this.selectedNote = null;
// // //                 } else {
// // //                   this.loadDailyNotes();
// // //                 }
// // //               },
// // //               error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // //             });
// // //         }
// // //     });
// // //   }

// // //   editNoteFromPreview(note: Note | null): void {
// // //     if (!note) return;
// // //     this.date = { date: new Date(note.createdAt) };
// // //     this._noteToSelectAfterLoad = note._id;
// // //     this.activeTabIndex = 0;
// // //     this.cdr.markForCheck();
// // //     // ngOnChanges will be triggered by the date change and handle the rest
// // //   }

// // //   onImageUploaded(url: string): void {
// // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // //   }

// // //   removeAttachment(index: number): void {
// // //     const attachments = [...this.noteForm.get('attachments')?.value || []];
// // //     attachments.splice(index, 1);
// // //     this.noteForm.get('attachments')?.setValue(attachments);
// // //   }

// // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

// // //   isEditable(note: Note | null): boolean {
// // //     if (!note?.createdAt) return false;
// // //     // Allow editing/deleting if the note was created within the last 24 hours.
// // //     const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
// // //     return new Date(note.createdAt).getTime() > twentyFourHoursAgo;
// // //   }

// // //   private sortNotes(notes: Note[]): Note[] {
// // //     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// // //   }

// // //   private resetAllNotes(): void {
// // //     this.dailyNotes = [];
// // //     this.filteredDailyNotes = [];
// // //     this.summaries.forEach(s => s.data = []);
// // //     this.loadedTabs = { week: false, month: false, year: false };
// // //     this.startNewNote();
// // //   }
// // // }

// // // import {
// // //   Component,
// // //   Input,
// // //   OnInit,
// // //   OnChanges,
// // //   SimpleChanges,
// // //   inject,
// // //   ChangeDetectionStrategy,
// // //   ChangeDetectorRef
// // // } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// // // // --- Your App's Modules & Components ---
// // // import { ImageUploaderComponent } from '../image-uploader.component';
// // // import { NoteService } from '../../../core/services/notes.service';

// // // // --- PrimeNG Modules for UI ---
// // // import { ButtonModule } from 'primeng/button';
// // // import { InputTextModule } from 'primeng/inputtext';
// // // import { TextareaModule } from 'primeng/textarea';
// // // import { ChipsModule } from 'primeng/chips';
// // // import { ToastModule } from 'primeng/toast';
// // // import { MessageService } from 'primeng/api';
// // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // import { TabViewModule } from 'primeng/tabview';
// // // import { TooltipModule } from 'primeng/tooltip';
// // // import { ImageModule } from 'primeng/image';
// // // // --- Define Interfaces and Types ---
// // // interface Note {
// // //   _id: string;
// // //   title: string;
// // //   content: string;
// // //   tags: string[];
// // //   attachments: string[];
// // //   createdAt: string;
// // // }

// // // interface CalendarDay {
// // //   date: Date;
// // // }

// // // type LoadingKey = 'day' | 'week' | 'month' | 'year';
// // // type SummaryKey = 'week' | 'month' | 'year';

// // // interface Summary {
// // //   title: string;
// // //   key: SummaryKey;
// // //   data: Note[];
// // //   icon: string;
// // // }

// // // @Component({
// // //   selector: 'app-notes-manager',
// // //   standalone: true,
// // //   imports: [
// // //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,ImageModule,
// // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// // //   ],
// // //   providers: [MessageService],
// // //   changeDetection: ChangeDetectionStrategy.OnPush,
// // //   templateUrl: './notes-manager.component.html',
// // //   styleUrls: ['./notes-manager.component.css']
// // // })
// // // export class NotesManagerComponent implements OnInit, OnChanges {
// // //   // --- Injected Services ---
// // //   private noteService = inject(NoteService);
// // //   private fb = inject(FormBuilder);
// // //   private messageService = inject(MessageService);
// // //   private cdr = inject(ChangeDetectorRef);

// // //   @Input() date!: CalendarDay;

// // //   // --- Component State ---
// // //   dailyNotes: Note[] = [];
// // //   filteredDailyNotes: Note[] = [];
// // //   summaries: Summary[] = [];
// // //   selectedNote: Note | null = null;
// // //   noteForm: FormGroup;
// // //   searchControl = new FormControl('');
// // //   isEditing = false;
// // //   isSaving = false;
// // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // //   activeTabIndex = 0;
// // //   private loadedTabs: { [key in SummaryKey]: boolean } = { week: false, month: false, year: false };
// // //   private _noteToSelectAfterLoad: string | null = null;

// // //   constructor() {
// // //     this.noteForm = this.fb.group({
// // //       _id: [null],
// // //       title: ['', Validators.required],
// // //       content: ['', Validators.required],
// // //       tags: [[]],
// // //       attachments: [[]],
// // //       createdAt: [null]
// // //     });
// // //   }

// // //   ngOnInit(): void {
// // //     this.summaries = [
// // //       { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // //       { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar' },
// // //       { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // //     ];
// // //     this.setupSearch();
// // //   }

// // //   ngOnChanges(changes: SimpleChanges): void {
// // //     if (changes['date']?.currentValue) {
// // //       this.activeTabIndex = 0;
// // //       this.resetAllNotes();
// // //       this.loadDailyNotes();
// // //     }
// // //   }

// // //   trackNoteById(index: number, note: Note): string {
// // //     return note._id;
// // //   }

// // //   private setupSearch(): void {
// // //     this.searchControl.valueChanges.pipe(
// // //       debounceTime(300),
// // //       distinctUntilChanged()
// // //     ).subscribe(searchTerm => {
// // //       const term = (searchTerm || '').toLowerCase();
// // //       this.filteredDailyNotes = !term
// // //         ? this.dailyNotes
// // //         : this.dailyNotes.filter(n =>
// // //             n.title.toLowerCase().includes(term) ||
// // //             n.content.toLowerCase().includes(term)
// // //           );
// // //       this.cdr.markForCheck();
// // //     });
// // //   }

// // //   private createDataHandler<T extends { data: { notes: Note[] } }>(callback: (res: T) => void) {
// // //     return {
// // //       next: (res: T) => {
// // //         callback(res);
// // //       },
// // //       error: (err: any) => {
// // //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// // //       }
// // //     };
// // //   }
  
// // //   private updateLoadingState(key: LoadingKey, value: boolean): void {
// // //     this.isLoading[key] = value;
// // //     this.cdr.markForCheck();
// // //   }

// // //   loadDailyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.updateLoadingState('day', true);
// // //     if (!this._noteToSelectAfterLoad) {
// // //       this.startNewNote();
// // //     }
// // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // //       .pipe(finalize(() => this.updateLoadingState('day', false)))
// // //       .subscribe(this.createDataHandler(res => {
// // //         this.dailyNotes = this.sortNotes(res.data.notes || []);
// // //         this.filteredDailyNotes = this.dailyNotes;
// // //         if (this._noteToSelectAfterLoad) {
// // //           const noteToEdit = this.dailyNotes.find(n => n._id === this._noteToSelectAfterLoad);
// // //           if (noteToEdit) {
// // //             this.selectNote(noteToEdit);
// // //           }
// // //           this._noteToSelectAfterLoad = null;
// // //         }
// // //       }));
// // //   }

// // //   loadWeeklyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.updateLoadingState('week', true);
// // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // //       .pipe(finalize(() => this.updateLoadingState('week', false)))
// // //       .subscribe(this.createDataHandler(res => {
// // //         this.summaries[0].data = this.sortNotes(res.data.notes || []);
// // //         this.loadedTabs.week = true;
// // //       }));
// // //   }

// // //   loadMonthlyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.updateLoadingState('month', true);
// // //     const d = this.date.date;
// // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // //       .pipe(finalize(() => this.updateLoadingState('month', false)))
// // //       .subscribe(this.createDataHandler(res => {
// // //         this.summaries[1].data = this.sortNotes(res.data.notes || []);
// // //         this.loadedTabs.month = true;
// // //       }));
// // //   }

// // //   loadYearlyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.updateLoadingState('year', true);
// // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // //       .pipe(finalize(() => this.updateLoadingState('year', false)))
// // //       .subscribe(this.createDataHandler(res => {
// // //         this.summaries[2].data = this.sortNotes(res.data.notes || []);
// // //         this.loadedTabs.year = true;
// // //       }));
// // //   }

// // //   refreshCurrentView(): void {
// // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // //     const actions: { [key in LoadingKey]: () => void } = {
// // //       day: () => this.loadDailyNotes(),
// // //       week: () => this.loadWeeklyNotes(),
// // //       month: () => this.loadMonthlyNotes(),
// // //       year: () => this.loadYearlyNotes(),
// // //     };
// // //     actions[tabKey]();
// // //   }
  
// // //   onTabChange(event: { index: number }): void {
// // //     this.activeTabIndex = event.index;
// // //     this.selectedNote = null;
// // //     if (this.activeTabIndex > 0) {
// // //       const summary = this.summaries[this.activeTabIndex - 1];
// // //       if (summary && !this.loadedTabs[summary.key]) {
// // //         this.refreshCurrentView();
// // //       }
// // //     }
// // //   }

// // //   selectNote(note: Note): void {
// // //     this.selectedNote = note;
// // //     this.isEditing = true;
// // //     this.noteForm.reset(note);
// // //     this.isEditable(note) ? this.noteForm.enable() : this.noteForm.disable();
// // //   }

// // //   selectForPreview(note: Note): void {
// // //     this.selectedNote = note;
// // //   }

// // //   startNewNote(): void {
// // //     this.selectedNote = null;
// // //     this.isEditing = false;
// // //     this.noteForm.enable();
// // //     this.noteForm.reset({
// // //       createdAt: this.date ? this.date.date : new Date(),
// // //       tags: [],
// // //       attachments: []
// // //     });
// // //   }

// // //   saveNote(): void {
// // //     if (this.noteForm.invalid) return;
// // //     this.isSaving = true;
// // //     const formData = this.noteForm.getRawValue();
// // //     const operation = this.isEditing
// // //       ? this.noteService.updateNote(formData._id, formData)
// // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // //     operation.pipe(finalize(() => {
// // //       this.isSaving = false;
// // //       this.cdr.markForCheck();
// // //     })).subscribe({
// // //       next: (res: any) => {
// // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // //         this.loadDailyNotes();
// // //         if (res.data.note) {
// // //           this.selectNote(res.data.note);
// // //         }
// // //       },
// // //       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // //     });
// // //   }

// // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // //     if (event) event.stopPropagation();
// // //     if (!note || !this.isEditable(note)) {
// // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'This note is too old to be deleted.' });
// // //         return;
// // //     }
// // //     // Ideally, use a confirmation dialog here
// // //     this.noteService.deleteNote(note._id).subscribe({
// // //       next: () => {
// // //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // //         this.loadDailyNotes();
// // //       },
// // //       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // //     });
// // //   }

// // //   editNoteFromPreview(note: Note | null): void {
// // //     if (!note) return;
// // //     this.date = { date: new Date(note.createdAt) };
// // //     this._noteToSelectAfterLoad = note._id;
// // //     this.activeTabIndex = 0;
// // //     this.cdr.markForCheck();
// // //     // ngOnChanges will be triggered by the date change and handle the rest
// // //   }

// // //   onImageUploaded(url: string): void {
// // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // //   }

// // //   removeAttachment(index: number): void {
// // //     const attachments = [...this.noteForm.get('attachments')?.value || []];
// // //     attachments.splice(index, 1);
// // //     this.noteForm.get('attachments')?.setValue(attachments);
// // //   }

// // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

// // //   isEditable(note: Note | null): boolean {
// // //     if (!note?.createdAt) return false;
// // //     // Allow editing/deleting if the note was created within the last 24 hours.
// // //     const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
// // //     return new Date(note.createdAt).getTime() > twentyFourHoursAgo;
// // //   }

// // //   private sortNotes(notes: Note[]): Note[] {
// // //     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// // //   }

// // //   private resetAllNotes(): void {
// // //     this.dailyNotes = [];
// // //     this.filteredDailyNotes = [];
// // //     this.summaries.forEach(s => s.data = []);
// // //     this.loadedTabs = { week: false, month: false, year: false };
// // //     this.startNewNote();
// // //   }
// // // }



// // // // import {
// // // //   Component,
// // // //   Input,
// // // //   OnInit,
// // // //   OnChanges,
// // // //   SimpleChanges,
// // // //   inject,
// // // //   ChangeDetectionStrategy,
// // // //   ChangeDetectorRef
// // // // } from '@angular/core';
// // // // import { CommonModule } from '@angular/common';
// // // // import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // // import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// // // // // --- Your App's Modules & Components ---
// // // // // Note: Ensure these paths are correct for your project structure.
// // // // import { ImageUploaderComponent } from '../image-uploader.component';
// // // // import { NoteService } from '../../../core/services/notes.service';

// // // // // --- PrimeNG Modules for UI ---
// // // // import { ButtonModule } from 'primeng/button';
// // // // import { InputTextModule } from 'primeng/inputtext';
// // // // import { TextareaModule } from 'primeng/textarea';
// // // // import { ChipsModule } from 'primeng/chips';
// // // // import { ToastModule } from 'primeng/toast';
// // // // import { MessageService } from 'primeng/api';
// // // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // // import { TabViewModule } from 'primeng/tabview';
// // // // import { TooltipModule } from 'primeng/tooltip';

// // // // // --- Define Interfaces and Types ---
// // // // interface Note {
// // // //   _id: string;
// // // //   title: string;
// // // //   content: string;
// // // //   tags: string[];
// // // //   attachments: string[];
// // // //   createdAt: string;
// // // // }

// // // // interface CalendarDay {
// // // //   date: Date;
// // // // }

// // // // type LoadingKey = 'day' | 'week' | 'month' | 'year';
// // // // // FIX: Create a more specific type for summary tabs to ensure 'day' is excluded.
// // // // type SummaryLoadingKey = 'week' | 'month' | 'year';

// // // // interface Summary {
// // // //   title: string;
// // // //   key: SummaryLoadingKey; // Use the more specific type here.
// // // //   data: Note[];
// // // //   icon: string;
// // // // }

// // // // @Component({
// // // //   selector: 'app-notes-manager',
// // // //   standalone: true,
// // // //   imports: [
// // // //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// // // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// // // //   ],
// // // //   providers: [MessageService],
// // // //   changeDetection: ChangeDetectionStrategy.OnPush, // Performance Boost!
// // // //   templateUrl: './notes-manager.component.html',
// // // //   styleUrls: ['./notes-manager.component.css']
// // // // })
// // // // export class NotesManagerComponent implements OnInit, OnChanges {
// // // //   // --- Injected Services ---
// // // //   private noteService = inject(NoteService);
// // // //   private fb = inject(FormBuilder);
// // // //   private messageService = inject(MessageService);
// // // //   private cdr = inject(ChangeDetectorRef); // Manually trigger updates

// // // //   @Input() date!: CalendarDay;

// // // //   // --- Component State ---
// // // //   dailyNotes: Note[] = [];
// // // //   filteredDailyNotes: Note[] = [];
// // // //   summaries: Summary[] = [];
// // // //   selectedNote: Note | null = null;
// // // //   noteForm: FormGroup;
// // // //   searchControl = new FormControl('');
// // // //   isEditing = false;
// // // //   isSaving = false;
// // // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // // //   activeTabIndex = 0;
// // // //   // FIX: Use the specific SummaryLoadingKey type for the keys.
// // // //   private loadedTabs: { [key in SummaryLoadingKey]: boolean } = { week: false, month: false, year: false };

// // // //   constructor() {
// // // //     this.noteForm = this.fb.group({
// // // //       _id: [null],
// // // //       title: ['', Validators.required],
// // // //       content: ['', Validators.required],
// // // //       tags: [[]],
// // // //       attachments: [[]],
// // // //       createdAt: [null]
// // // //     });
// // // //   }

// // // //   ngOnInit(): void {
// // // //     this.summaries = [
// // // //       { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // // //       { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar' },
// // // //       { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // // //     ];
// // // //     this.setupSearch();
// // // //   }

// // // //   ngOnChanges(changes: SimpleChanges): void {
// // // //     if (changes['date']?.currentValue) {
// // // //       this.activeTabIndex = 0;
// // // //       this.resetAllNotes();
// // // //       this.loadDailyNotes();
// // // //     }
// // // //   }

// // // //   /** Performance: Efficiently tracks items in a list. */
// // // //   trackNoteById(index: number, note: Note): string {
// // // //     return note._id;
// // // //   }

// // // //   /** Performance: Debounces search input to prevent excessive filtering. */
// // // //   private setupSearch(): void {
// // // //     this.searchControl.valueChanges.pipe(
// // // //       debounceTime(300), // Wait 300ms after user stops typing
// // // //       distinctUntilChanged() // Only fire if value is different
// // // //     ).subscribe(searchTerm => {
// // // //       const term = (searchTerm || '').toLowerCase();
// // // //       this.filteredDailyNotes = !term
// // // //         ? this.dailyNotes
// // // //         : this.dailyNotes.filter(n =>
// // // //           n.title.toLowerCase().includes(term) ||
// // // //           n.content.toLowerCase().includes(term)
// // // //         );
// // // //       this.cdr.markForCheck(); // Update the view with filtered results
// // // //     });
// // // //   }

// // // //   // --- DATA LOADING & STATE MANAGEMENT ---
// // // //   /** CORRECTED: This handler now passes the response to the loader function. */
// // // //   private createDataHandler(loader: (response: any) => void) {
// // // //     return {
// // // //       next: (res: any) => {
// // // //         if (res?.data) {
// // // //           loader(res); // Pass the entire response object
// // // //         }
// // // //       },
// // // //       error: (err: any) => {
// // // //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// // // //       }
// // // //     };
// // // //   }
  
// // // //   private updateLoadingState(key: LoadingKey, value: boolean): void {
// // // //     this.isLoading[key] = value;
// // // //     this.cdr.markForCheck();
// // // //   }

// // // //   loadDailyNotes(): void {
// // // //     if (!this.date?.date) return;
// // // //     this.updateLoadingState('day', true);
// // // //     this.startNewNote();
// // // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // // //       .pipe(finalize(() => this.updateLoadingState('day', false)))
// // // //       .subscribe(this.createDataHandler((res) => { // 'res' is now available here
// // // //         this.dailyNotes = this.sortNotes(res.data.notes || []);
// // // //         this.filteredDailyNotes = this.dailyNotes;
// // // //       }));
// // // //   }

// // // //   loadWeeklyNotes(): void {
// // // //     if (!this.date?.date) return;
// // // //     this.updateLoadingState('week', true);
// // // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // // //       .pipe(finalize(() => this.updateLoadingState('week', false)))
// // // //       .subscribe(this.createDataHandler((res) => { // 'res' is now available here
// // // //         this.summaries[0].data = this.sortNotes(res.data.notes || []);
// // // //         this.loadedTabs.week = true;
// // // //       }));
// // // //   }

// // // //   loadMonthlyNotes(): void {
// // // //     if (!this.date?.date) return;
// // // //     this.updateLoadingState('month', true);
// // // //     const d = this.date.date;
// // // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // // //       .pipe(finalize(() => this.updateLoadingState('month', false)))
// // // //       .subscribe(this.createDataHandler((res) => { // 'res' is now available here
// // // //         this.summaries[1].data = this.sortNotes(res.data.notes || []);
// // // //         this.loadedTabs.month = true;
// // // //       }));
// // // //   }

// // // //   loadYearlyNotes(): void {
// // // //     if (!this.date?.date) return;
// // // //     this.updateLoadingState('year', true);
// // // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // // //       .pipe(finalize(() => this.updateLoadingState('year', false)))
// // // //       .subscribe(this.createDataHandler((res) => { // 'res' is now available here
// // // //         this.summaries[2].data = this.sortNotes(res.data.notes || []);
// // // //         this.loadedTabs.year = true;
// // // //       }));
// // // //   }

// // // //   // --- UI ACTIONS & EVENT HANDLERS ---
// // // //   refreshCurrentView(): void {
// // // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // // //     const actions: { [key in LoadingKey]: () => void } = {
// // // //       day: () => this.loadDailyNotes(),
// // // //       week: () => this.loadWeeklyNotes(),
// // // //       month: () => this.loadMonthlyNotes(),
// // // //       year: () => this.loadYearlyNotes(),
// // // //     };
// // // //     actions[tabKey]();
// // // //   }
  
// // // //   onTabChange(event: { index: number }): void {
// // // //     this.activeTabIndex = event.index;
// // // //     this.selectedNote = null; // Clear selection when changing tabs
// // // //     if (this.activeTabIndex > 0) {
// // // //       const summary = this.summaries[this.activeTabIndex - 1];
// // // //       // This check is now type-safe because summary.key is SummaryLoadingKey
// // // //       if (summary && !this.loadedTabs[summary.key]) {
// // // //         this.refreshCurrentView();
// // // //       }
// // // //     }
// // // //   }

// // // //   selectNote(note: Note): void {
// // // //     this.selectedNote = note;
// // // //     this.isEditing = true;
// // // //     this.noteForm.reset(note); // Use reset for a cleaner update
// // // //     this.isEditable(note) ? this.noteForm.enable() : this.noteForm.disable();
// // // //   }

// // // //   selectForPreview(note: Note): void {
// // // //     this.selectedNote = note;
// // // //   }

// // // //   startNewNote(): void {
// // // //     this.selectedNote = null;
// // // //     this.isEditing = false;
// // // //     this.noteForm.enable();
// // // //     this.noteForm.reset({
// // // //       createdAt: this.date ? this.date.date : new Date(),
// // // //       tags: [],
// // // //       attachments: []
// // // //     });
// // // //   }

// // // //   saveNote(): void {
// // // //     if (this.noteForm.invalid) return;
// // // //     this.isSaving = true;
// // // //     const formData = this.noteForm.getRawValue();
// // // //     const operation = this.isEditing
// // // //       ? this.noteService.updateNote(formData._id, formData)
// // // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // // //     operation.pipe(finalize(() => {
// // // //       this.isSaving = false;
// // // //       this.cdr.markForCheck();
// // // //     })).subscribe({
// // // //       next: (res) => {
// // // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // // //         this.loadDailyNotes();
// // // //         if (res?.data?.note) {
// // // //           this.selectNote(res.data.note);
// // // //         }
// // // //       },
// // // //       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // // //     });
// // // //   }

// // // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // // //     if (event) event.stopPropagation();
// // // //     if (!note || !this.isEditable(note)) {
// // // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
// // // //         return;
// // // //     }
// // // //     // Ideally, use a confirmation dialog here
// // // //     this.noteService.deleteNote(note._id).subscribe({
// // // //       next: () => {
// // // //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // // //         this.loadDailyNotes();
// // // //       },
// // // //       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // // //     });
// // // //   }

// // // //   onImageUploaded(url: string): void {
// // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // // //   }

// // // //   removeAttachment(index: number): void {
// // // //     const attachments = [...this.noteForm.get('attachments')?.value || []];
// // // //     attachments.splice(index, 1);
// // // //     this.noteForm.get('attachments')?.setValue(attachments);
// // // //   }

// // // //   // --- UTILITY METHODS ---
// // // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

// // // //   isEditable(note: Note | null): boolean {
// // // //     if (!note?.createdAt) return false;
// // // //     const noteDate = new Date(note.createdAt);
// // // //     const today = new Date();
// // // //     return noteDate.getFullYear() === today.getFullYear() &&
// // // //            noteDate.getMonth() === today.getMonth() &&
// // // //            noteDate.getDate() === today.getDate();
// // // //   }

// // // //   private sortNotes(notes: Note[]): Note[] {
// // // //     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// // // //   }

// // // //   private resetAllNotes(): void {
// // // //     this.dailyNotes = [];
// // // //     this.filteredDailyNotes = [];
// // // //     this.summaries.forEach(s => s.data = []);
// // // //     this.loadedTabs = { week: false, month: false, year: false };
// // // //     this.startNewNote();
// // // //   }
// // // // }


// // // // // import {
// // // // //   Component,
// // // // //   Input,
// // // // //   OnInit,
// // // // //   OnChanges,
// // // // //   SimpleChanges,
// // // // //   inject,
// // // // //   ChangeDetectionStrategy,
// // // // //   ChangeDetectorRef
// // // // // } from '@angular/core';
// // // // // import { CommonModule } from '@angular/common';
// // // // // import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // // // import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// // // // // // --- Your App's Modules & Components ---
// // // // // // Note: Ensure these paths are correct for your project structure.
// // // // // import { ImageUploaderComponent } from '../image-uploader.component';
// // // // // import { NoteService } from '../../../core/services/notes.service';

// // // // // // --- PrimeNG Modules for UI ---
// // // // // import { ButtonModule } from 'primeng/button';
// // // // // import { InputTextModule } from 'primeng/inputtext';
// // // // // import { TextareaModule } from 'primeng/textarea';
// // // // // import { ChipsModule } from 'primeng/chips';
// // // // // import { ToastModule } from 'primeng/toast';
// // // // // import { MessageService } from 'primeng/api';
// // // // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // // // import { TabViewModule } from 'primeng/tabview';
// // // // // import { TooltipModule } from 'primeng/tooltip';

// // // // // // --- Define Interfaces and Types ---
// // // // // interface Note {
// // // // //   _id: string;
// // // // //   title: string;
// // // // //   content: string;
// // // // //   tags: string[];
// // // // //   attachments: string[];
// // // // //   createdAt: string;
// // // // // }

// // // // // interface CalendarDay {
// // // // //   date: Date;
// // // // // }

// // // // // type LoadingKey = 'day' | 'week' | 'month' | 'year';

// // // // // interface Summary {
// // // // //   title: string;
// // // // //   key: LoadingKey;
// // // // //   data: Note[];
// // // // //   icon: string;
// // // // // }

// // // // // @Component({
// // // // //   selector: 'app-notes-manager',
// // // // //   standalone: true,
// // // // //   imports: [
// // // // //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// // // // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // // // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// // // // //   ],
// // // // //   providers: [MessageService],
// // // // //   changeDetection: ChangeDetectionStrategy.OnPush, // Performance Boost!
// // // // //   templateUrl: './notes-manager.component.html',
// // // // //   styleUrls: ['./notes-manager.component.css']
// // // // // })
// // // // // export class NotesManagerComponent implements OnInit, OnChanges {
// // // // //   // --- Injected Services ---
// // // // //   private noteService = inject(NoteService);
// // // // //   private fb = inject(FormBuilder);
// // // // //   private messageService = inject(MessageService);
// // // // //   private cdr = inject(ChangeDetectorRef); // Manually trigger updates

// // // // //   @Input() date!: CalendarDay;

// // // // //   // --- Component State ---
// // // // //   dailyNotes: Note[] = [];
// // // // //   filteredDailyNotes: Note[] = [];
// // // // //   summaries: Summary[] = [];
// // // // //   selectedNote: Note | null = null;
// // // // //   noteForm: FormGroup;
// // // // //   searchControl = new FormControl('');
// // // // //   isEditing = false;
// // // // //   isSaving = false;
// // // // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // // // //   activeTabIndex = 0;
// // // // //   private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

// // // // //   constructor() {
// // // // //     this.noteForm = this.fb.group({
// // // // //       _id: [null],
// // // // //       title: ['', Validators.required],
// // // // //       content: ['', Validators.required],
// // // // //       tags: [[]],
// // // // //       attachments: [[]],
// // // // //       createdAt: [null]
// // // // //     });
// // // // //   }

// // // // //   ngOnInit(): void {
// // // // //     this.summaries = [
// // // // //       { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // // // //       { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar' },
// // // // //       { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // // // //     ];
// // // // //     this.setupSearch();
// // // // //   }

// // // // //   ngOnChanges(changes: SimpleChanges): void {
// // // // //     if (changes['date']?.currentValue) {
// // // // //       this.activeTabIndex = 0;
// // // // //       this.resetAllNotes();
// // // // //       this.loadDailyNotes();
// // // // //     }
// // // // //   }

// // // // //   /** Performance: Efficiently tracks items in a list. */
// // // // //   trackNoteById(index: number, note: Note): string {
// // // // //     return note._id;
// // // // //   }

// // // // //   /** Performance: Debounces search input to prevent excessive filtering. */
// // // // //   private setupSearch(): void {
// // // // //     this.searchControl.valueChanges.pipe(
// // // // //       debounceTime(300), // Wait 300ms after user stops typing
// // // // //       distinctUntilChanged() // Only fire if value is different
// // // // //     ).subscribe(searchTerm => {
// // // // //       const term = (searchTerm || '').toLowerCase();
// // // // //       this.filteredDailyNotes = !term
// // // // //         ? this.dailyNotes
// // // // //         : this.dailyNotes.filter(n =>
// // // // //           n.title.toLowerCase().includes(term) ||
// // // // //           n.content.toLowerCase().includes(term)
// // // // //         );
// // // // //       this.cdr.markForCheck(); // Update the view with filtered results
// // // // //     });
// // // // //   }

// // // // //   // --- DATA LOADING & STATE MANAGEMENT ---
// // // // //   /** CORRECTED: This handler now passes the response to the loader function. */
// // // // //   private createDataHandler(loader: (response: any) => void) {
// // // // //     return {
// // // // //       next: (res: any) => {
// // // // //         if (res?.data) {
// // // // //           loader(res); // Pass the entire response object
// // // // //         }
// // // // //       },
// // // // //       error: (err: any) => {
// // // // //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// // // // //       }
// // // // //     };
// // // // //   }
  
// // // // //   private updateLoadingState(key: LoadingKey, value: boolean): void {
// // // // //     this.isLoading[key] = value;
// // // // //     this.cdr.markForCheck();
// // // // //   }

// // // // //   loadDailyNotes(): void {
// // // // //     if (!this.date?.date) return;
// // // // //     this.updateLoadingState('day', true);
// // // // //     this.startNewNote();
// // // // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // // // //       .pipe(finalize(() => this.updateLoadingState('day', false)))
// // // // //       .subscribe(this.createDataHandler((res) => { // 'res' is now available here
// // // // //         this.dailyNotes = this.sortNotes(res.data.notes || []);
// // // // //         this.filteredDailyNotes = this.dailyNotes;
// // // // //       }));
// // // // //   }

// // // // //   loadWeeklyNotes(): void {
// // // // //     if (!this.date?.date) return;
// // // // //     this.updateLoadingState('week', true);
// // // // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // // // //       .pipe(finalize(() => this.updateLoadingState('week', false)))
// // // // //       .subscribe(this.createDataHandler((res) => { // 'res' is now available here
// // // // //         this.summaries[0].data = this.sortNotes(res.data.notes || []);
// // // // //         this.loadedTabs.week = true;
// // // // //       }));
// // // // //   }

// // // // //   loadMonthlyNotes(): void {
// // // // //     if (!this.date?.date) return;
// // // // //     this.updateLoadingState('month', true);
// // // // //     const d = this.date.date;
// // // // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // // // //       .pipe(finalize(() => this.updateLoadingState('month', false)))
// // // // //       .subscribe(this.createDataHandler((res) => { // 'res' is now available here
// // // // //         this.summaries[1].data = this.sortNotes(res.data.notes || []);
// // // // //         this.loadedTabs.month = true;
// // // // //       }));
// // // // //   }

// // // // //   loadYearlyNotes(): void {
// // // // //     if (!this.date?.date) return;
// // // // //     this.updateLoadingState('year', true);
// // // // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // // // //       .pipe(finalize(() => this.updateLoadingState('year', false)))
// // // // //       .subscribe(this.createDataHandler((res) => { // 'res' is now available here
// // // // //         this.summaries[2].data = this.sortNotes(res.data.notes || []);
// // // // //         this.loadedTabs.year = true;
// // // // //       }));
// // // // //   }

// // // // //   // --- UI ACTIONS & EVENT HANDLERS ---
// // // // //   refreshCurrentView(): void {
// // // // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // // // //     const actions: { [key in LoadingKey]: () => void } = {
// // // // //       day: () => this.loadDailyNotes(),
// // // // //       week: () => this.loadWeeklyNotes(),
// // // // //       month: () => this.loadMonthlyNotes(),
// // // // //       year: () => this.loadYearlyNotes(),
// // // // //     };
// // // // //     actions[tabKey]();
// // // // //   }
  
// // // // //   onTabChange(event: { index: number }): void {
// // // // //     this.activeTabIndex = event.index;
// // // // //     this.selectedNote = null; // Clear selection when changing tabs
// // // // //     if (this.activeTabIndex > 0) {
// // // // //       const summary = this.summaries[this.activeTabIndex - 1];
// // // // //       if (summary && !this.loadedTabs[summary.key]) {
// // // // //         this.refreshCurrentView();
// // // // //       }
// // // // //     }
// // // // //   }

// // // // //   selectNote(note: Note): void {
// // // // //     this.selectedNote = note;
// // // // //     this.isEditing = true;
// // // // //     this.noteForm.reset(note); // Use reset for a cleaner update
// // // // //     this.isEditable(note) ? this.noteForm.enable() : this.noteForm.disable();
// // // // //   }

// // // // //   selectForPreview(note: Note): void {
// // // // //     this.selectedNote = note;
// // // // //   }

// // // // //   startNewNote(): void {
// // // // //     this.selectedNote = null;
// // // // //     this.isEditing = false;
// // // // //     this.noteForm.enable();
// // // // //     this.noteForm.reset({
// // // // //       createdAt: this.date ? this.date.date : new Date(),
// // // // //       tags: [],
// // // // //       attachments: []
// // // // //     });
// // // // //   }

// // // // //   saveNote(): void {
// // // // //     if (this.noteForm.invalid) return;
// // // // //     this.isSaving = true;
// // // // //     const formData = this.noteForm.getRawValue();
// // // // //     const operation = this.isEditing
// // // // //       ? this.noteService.updateNote(formData._id, formData)
// // // // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // // // //     operation.pipe(finalize(() => {
// // // // //       this.isSaving = false;
// // // // //       this.cdr.markForCheck();
// // // // //     })).subscribe({
// // // // //       next: (res) => {
// // // // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // // // //         this.loadDailyNotes();
// // // // //         if (res?.data?.note) {
// // // // //           this.selectNote(res.data.note);
// // // // //         }
// // // // //       },
// // // // //       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // // // //     });
// // // // //   }

// // // // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // // // //     if (event) event.stopPropagation();
// // // // //     if (!note || !this.isEditable(note)) {
// // // // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
// // // // //         return;
// // // // //     }
// // // // //     // Ideally, use a confirmation dialog here
// // // // //     this.noteService.deleteNote(note._id).subscribe({
// // // // //       next: () => {
// // // // //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // // // //         this.loadDailyNotes();
// // // // //       },
// // // // //       error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // // // //     });
// // // // //   }

// // // // //   onImageUploaded(url: string): void {
// // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // // // //   }

// // // // //   removeAttachment(index: number): void {
// // // // //     const attachments = [...this.noteForm.get('attachments')?.value || []];
// // // // //     attachments.splice(index, 1);
// // // // //     this.noteForm.get('attachments')?.setValue(attachments);
// // // // //   }

// // // // //   // --- UTILITY METHODS ---
// // // // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

// // // // //   isEditable(note: Note | null): boolean {
// // // // //     if (!note?.createdAt) return false;
// // // // //     const noteDate = new Date(note.createdAt);
// // // // //     const today = new Date();
// // // // //     return noteDate.getFullYear() === today.getFullYear() &&
// // // // //            noteDate.getMonth() === today.getMonth() &&
// // // // //            noteDate.getDate() === today.getDate();
// // // // //   }

// // // // //   private sortNotes(notes: Note[]): Note[] {
// // // // //     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// // // // //   }

// // // // //   private resetAllNotes(): void {
// // // // //     this.dailyNotes = [];
// // // // //     this.filteredDailyNotes = [];
// // // // //     this.summaries.forEach(s => s.data = []);
// // // // //     this.loadedTabs = { week: false, month: false, year: false };
// // // // //     this.startNewNote();
// // // // //   }
// // // // // }


// // // // // import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy } from '@angular/core';
// // // // // import { CommonModule } from '@angular/common';
// // // // // import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // // // import { finalize } from 'rxjs/operators';

// // // // // // --- Your App's Modules & Components ---
// // // // // import { ImageUploaderComponent } from '../image-uploader.component';
// // // // // import { NoteService, NoteFilterParams } from '../../../core/services/notes.service';

// // // // // // --- PrimeNG Modules for UI ---
// // // // // import { ButtonModule } from 'primeng/button';
// // // // // import { InputTextModule } from 'primeng/inputtext';
// // // // // import { TextareaModule } from 'primeng/textarea';
// // // // // import { ChipsModule } from 'primeng/chips';
// // // // // import { ToastModule } from 'primeng/toast';
// // // // // import { MessageService } from 'primeng/api';
// // // // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // // // import { TabViewModule } from 'primeng/tabview';
// // // // // import { TooltipModule } from 'primeng/tooltip';

// // // // // // --- Define Interfaces and Types ---
// // // // // interface Note {
// // // // //   _id: string;
// // // // //   title: string;
// // // // //   content: string;
// // // // //   tags: string[];
// // // // //   attachments: string[];
// // // // //   createdAt: string;
// // // // // }

// // // // // interface CalendarDay {
// // // // //   date: Date;
// // // // // }

// // // // // type LoadingKey = 'day' | 'week' | 'month' | 'year';

// // // // // interface Summary {
// // // // //   title: string;
// // // // //   key: LoadingKey;
// // // // //   data: Note[];
// // // // //   icon: string;
// // // // // }

// // // // // @Component({
// // // // //   selector: 'app-notes-manager',
// // // // //   standalone: true,
// // // // //   imports: [
// // // // //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// // // // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // // // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// // // // //   ],
// // // // //     changeDetection: ChangeDetectionStrategy.OnPush, // <-- ADD THIS LINE

// // // // //   providers: [MessageService],
// // // // //     template: `
// // // // //     <p-toast></p-toast>
// // // // //   <p-toast></p-toast>
// // // // // <div class="notes-manager-host">
// // // // //   <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">

// // // // //     <p-tabPanel>
// // // // //       <ng-template pTemplate="header">
// // // // //         <i class="pi pi-calendar-day mr-2"></i>
// // // // //         <span>Day</span>
// // // // //       </ng-template>

// // // // //       <div class="notes-layout">
// // // // //         <div class="notes-sidebar">
// // // // //           <div class="sidebar-header">
// // // // //             <h2 class="section-title">Daily Notes</h2>
// // // // //             <div class="header-actions">
// // // // //               <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh"></button>
// // // // //               <button pButton icon="pi pi-plus" label="New" class="p-button-sm" (click)="startNewNote()"></button>
// // // // //             </div>
// // // // //           </div>
// // // // //           <div class="sidebar-content">
// // // // //             <div class="search-bar">
// // // // //               <span class="p-input-icon-left w-full">
// // // // //                 <i class="pi pi-search"></i>
// // // // //                 <input type="text" pInputText placeholder="Search notes..." class="w-full p-inputtext-sm" (input)="filterNotes($event)">
// // // // //               </span>
// // // // //             </div>
// // // // //             <div class="notes-list-wrapper">
// // // // //               <ng-container *ngIf="!isLoading.day; else loadingState">
// // // // //                 <div class="notes-list" *ngIf="filteredDailyNotes.length > 0; else emptyState">
// // // // //                   <div *ngFor="let note of filteredDailyNotes; trackBy: trackNoteById" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectNote(note)">
// // // // //                     <h3 class="note-title">{{ note.title || 'Untitled Note' }}</h3>
// // // // //                     <p class="note-excerpt">{{ note.content | slice:0:80 }}{{ note.content.length > 80 ? '...' : '' }}</p>
// // // // //                     <div class="note-meta">
// // // // //                       <span class="note-date">{{ note.createdAt | date:'shortTime' }}</span>
// // // // //                       <div class="note-tags" *ngIf="note.tags.length > 0">
// // // // //                         <i class="pi pi-tag"></i>
// // // // //                         <span>{{ note.tags.length }}</span>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </ng-container>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>

// // // // //         <div class="note-editor-panel">
// // // // //           <form [formGroup]="noteForm" (ngSubmit)="saveNote()" class="note-form">
// // // // //             <div class="editor-header">
// // // // //               <input type="text" pInputText placeholder="Note Title" formControlName="title" class="title-input">
// // // // //               <div class="editor-actions">
// // // // //                   <button pButton type="submit" label="Save" icon="pi pi-check" class="p-button-sm" [disabled]="noteForm.invalid || isSaving || (isEditing && !isEditable(selectedNote))" [loading]="isSaving"></button>
// // // // //                   <button *ngIf="isEditing" pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm" [disabled]="!isEditable(selectedNote)" (click)="deleteNote(selectedNote)"></button>
// // // // //               </div>
// // // // //             </div>

// // // // //             <div class="editor-body">
// // // // //               <div class="editor-content">
// // // // //                 <textarea pInputTextarea placeholder="Start writing..." formControlName="content" class="content-textarea"></textarea>
// // // // //               </div>
// // // // //               <div class="editor-sidebar">
// // // // //                 <div class="sidebar-section">
// // // // //                   <label>Tags</label>
// // // // //                   <p-chips formControlName="tags" placeholder="Add tags..."></p-chips>
// // // // //                 </div>
// // // // //                 <div class="sidebar-section">
// // // // //                   <label>Attachments</label>
// // // // //                   <app-image-uploader (uploaded)="onImageUploaded($event)"></app-image-uploader>
// // // // //                   <div class="attachments-preview" *ngIf="noteForm.get('attachments')?.value?.length > 0">
// // // // //                     <div *ngFor="let url of noteForm.get('attachments')?.value; let i = index" class="attachment-thumb">
// // // // //                       <img [src]="url" alt="Preview">
// // // // //                       <button type="button" pButton icon="pi pi-times" class="remove-btn p-button-rounded p-button-danger p-button-text" (click)="removeAttachment(i)"></button>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </form>
// // // // //         </div>
// // // // //       </div>
// // // // //     </p-tabPanel>

// // // // //     <p-tabPanel *ngFor="let summary of summaries; let i = index">
// // // // //        <ng-template pTemplate="header">
// // // // //         <i class="mr-2" [ngClass]="summary.icon"></i>
// // // // //         <span>{{ summary.title }}</span>
// // // // //       </ng-template>

// // // // //       <div class="notes-layout summary-layout">
// // // // //         <div class="notes-sidebar">
// // // // //            <div class="sidebar-header">
// // // // //             <h2 class="section-title">{{ summary.title }} Notes</h2>
// // // // //             <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()"></button>
// // // // //           </div>
// // // // //           <div class="sidebar-content">
// // // // //             <div class="notes-list-wrapper">
// // // // //               <ng-container *ngIf="!isLoading[summary.key]; else loadingState">
// // // // //                 <div class="notes-list" *ngIf="summary.data.length > 0; else emptyState">
// // // // //                     <div *ngFor="let note of summary.data; trackBy: trackNoteById" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectForPreview(note)">
// // // // //                       <h3 class="note-title">{{ note.title }}</h3>
// // // // //                       <p class="note-excerpt">{{ note.content | slice:0:100 }}...</p>
// // // // //                        <div class="note-meta">
// // // // //                         <span class="note-date">{{ note.createdAt | date:'short' }}</span>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                 </div>
// // // // //               </ng-container>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //     <div class="note-preview-panel">
// // // // //     <ng-container *ngIf="selectedNote; else noPreviewSelected">
// // // // //         <div class="preview-header">
// // // // //             <h2 class="section-title">{{ selectedNote.title }}</h2>
// // // // //             <span class="preview-date">{{ selectedNote.createdAt | date:'fullDate' }}</span>
// // // // //         </div>
// // // // //         <div class="preview-content">
// // // // //            <p>{{ selectedNote.content }}</p>
// // // // //         </div>
// // // // //     </ng-container>

// // // // //     <ng-template #noPreviewSelected>
// // // // //       <div class="state-placeholder">
// // // // //         <i class="pi pi-file-edit placeholder-icon"></i>
// // // // //         <span class="placeholder-text">Select a note to preview</span>
// // // // //       </div>
// // // // //     </ng-template>
// // // // // </div>
// // // // //       </div>
// // // // //     </p-tabPanel>
// // // // //   </p-tabView>
// // // // // </div>

// // // // // <ng-template #loadingState>
// // // // //   <div class="state-placeholder">
// // // // //     <p-progressSpinner styleClass="w-8 h-8" strokeWidth="6"></p-progressSpinner>
// // // // //   </div>
// // // // // </ng-template>

// // // // // <ng-template #emptyState>
// // // // //   <div class="state-placeholder">
// // // // //     <i class="pi pi-inbox placeholder-icon"></i>
// // // // //     <span class="placeholder-text">No notes here.</span>
// // // // //   </div>
// // // // // </ng-template>

// // // // // <ng-template #noPreviewSelected>
// // // // //   <div class="state-placeholder">
// // // // //     <i class="pi pi-file-edit placeholder-icon"></i>
// // // // //     <span class="placeholder-text">Select a note to preview</span>
// // // // //   </div>
// // // // // </ng-template>
// // // // //   `,
// // // // //   styles: [`

// // // // // .notes-manager-host {
// // // // //   height: 75vh; /* Define a height for the component */
// // // // //   width: 100%;
// // // // //   display: flex;
// // // // //   flex-direction: column;
// // // // //   background-color: var(--color-background);
// // // // //   font-family: var(--font-sans);
// // // // //   font-size: 0.9rem;
// // // // // }

// // // // // /* --- TAB STYLES --- */
// // // // // :host ::ng-deep .p-tabview .p-tabview-nav {
// // // // //   background: var(--color-surface);
// // // // //   border-bottom: 1px solid var(--color-border);
// // // // // }
// // // // // :host ::ng-deep .p-tabview .p-tabview-panels {
// // // // //   padding: 0;
// // // // //   background-color: var(--color-background);
// // // // //   height: 100%;
// // // // // }

// // // // // /* --- MAIN LAYOUT --- */
// // // // // .notes-layout {
// // // // //   display: grid;
// // // // //   /* Responsive columns: sidebar shrinks to a min, editor takes rest */
// // // // //   grid-template-columns: minmax(280px, 1.2fr) 3fr;
// // // // //   gap: 1rem;
// // // // //   height: calc(75vh - 50px); /* Adjust based on tab header height */
// // // // //   padding: 1rem;
// // // // // }
// // // // // .summary-layout {
// // // // //   grid-template-columns: minmax(280px, 1fr) 2fr;
// // // // // }


// // // // // /* --- NOTES SIDEBAR --- */
// // // // // .notes-sidebar {
// // // // //   background: var(--color-surface);
// // // // //   border-radius: var(--border-radius-md);
// // // // //   border: 1px solid var(--color-border);
// // // // //   display: flex;
// // // // //   flex-direction: column;
// // // // //   overflow: hidden;
// // // // //   box-shadow: var(--shadow-sm);
// // // // // }
// // // // // .sidebar-header {
// // // // //   display: flex;
// // // // //   justify-content: space-between;
// // // // //   align-items: center;
// // // // //   padding: 0.75rem 1rem;
// // // // //   border-bottom: 1px solid var(--color-border);
// // // // //   flex-shrink: 0;
// // // // // }
// // // // // .section-title {
// // // // //   font-size: 1rem;
// // // // //   font-weight: var(--font-weight-semibold);
// // // // //   margin: 0;
// // // // // }
// // // // // .sidebar-content {
// // // // //   display: flex;
// // // // //   flex-direction: column;
// // // // //   flex-grow: 1;
// // // // //   overflow: hidden;
// // // // // }
// // // // // .search-bar {
// // // // //   padding: 0.75rem;
// // // // //   border-bottom: 1px solid var(--color-border);
// // // // // }

// // // // // .notes-list-wrapper {
// // // // //   flex-grow: 1;
// // // // //   overflow-y: auto;
// // // // //   padding: 0.5rem;
// // // // // }

// // // // // /* --- NOTE CARD --- */
// // // // // .note-card {
// // // // //   padding: 0.75rem 1rem;
// // // // //   border-radius: var(--border-radius-sm);
// // // // //   margin-bottom: 0.5rem;
// // // // //   cursor: pointer;
// // // // //   border: 1px solid transparent;
// // // // //   transition: var(--transition-fast);
// // // // //   background: transparent;
// // // // // }
// // // // // .note-card:hover {
// // // // //   background: var(--color-background);
// // // // // }
// // // // // .note-card.active {
// // // // //   background: var(--color-primary-light);
// // // // //   border-color: var(--color-primary);
// // // // // }

// // // // // .note-title {
// // // // //   font-size: 0.9rem;
// // // // //   font-weight: var(--font-weight-semibold);
// // // // //   margin: 0 0 0.25rem 0;
// // // // //   color: var(--color-text-primary);
// // // // // }
// // // // // .note-excerpt {
// // // // //   font-size: 0.8rem;
// // // // //   color: var(--color-text-secondary);
// // // // //   margin: 0;
// // // // //   line-height: 1.4;
// // // // // }
// // // // // .note-meta {
// // // // //   display: flex;
// // // // //   justify-content: space-between;
// // // // //   align-items: center;
// // // // //   margin-top: 0.5rem;
// // // // //   font-size: 0.75rem;
// // // // //   color: var(--color-text-tertiary);
// // // // // }
// // // // // .note-tags { display: flex; align-items: center; gap: 0.25rem; }

// // // // // /* --- NOTE EDITOR & PREVIEW PANELS --- */
// // // // // .note-editor-panel, .note-preview-panel {
// // // // //   background: var(--color-surface);
// // // // //   border-radius: var(--border-radius-md);
// // // // //   border: 1px solid var(--color-border);
// // // // //   display: flex;
// // // // //   flex-direction: column;
// // // // //   overflow: hidden;
// // // // //   box-shadow: var(--shadow-sm);
// // // // // }

// // // // // .note-form { display: flex; flex-direction: column; height: 100%; }

// // // // // .editor-header {
// // // // //   display: flex;
// // // // //   justify-content: space-between;
// // // // //   align-items: center;
// // // // //   padding: 0.5rem 1rem;
// // // // //   border-bottom: 1px solid var(--color-border);
// // // // //   flex-shrink: 0;
// // // // // }
// // // // // .title-input {
// // // // //   font-size: 1.25rem !important;
// // // // //   font-weight: var(--font-weight-bold) !important;
// // // // //   border: none !important;
// // // // //   box-shadow: none !important;
// // // // //   flex-grow: 1;
// // // // // }
// // // // // .editor-actions { display: flex; gap: 0.5rem; }

// // // // // .editor-body {
// // // // //   display: grid;
// // // // //   grid-template-columns: 3fr 1fr; /* Content | Metadata sidebar */
// // // // //   flex-grow: 1;
// // // // //   overflow: hidden;
// // // // // }

// // // // // .editor-content { padding: 1rem; overflow-y: auto; }
// // // // // .content-textarea {
// // // // //   width: 100%;
// // // // //   height: 100%;
// // // // //   resize: none;
// // // // //   border: none;
// // // // //   font-size: 1rem;
// // // // //   line-height: 1.6;
// // // // //   color: var(--color-text-primary);
// // // // // }
// // // // // .content-textarea:focus { box-shadow: none; }

// // // // // .editor-sidebar {
// // // // //   border-left: 1px solid var(--color-border);
// // // // //   padding: 1rem;
// // // // //   display: flex;
// // // // //   flex-direction: column;
// // // // //   gap: 1.5rem;
// // // // //   overflow-y: auto;
// // // // //   background-color: #fafbfd;
// // // // // }
// // // // // .sidebar-section label {
// // // // //   display: block;
// // // // //   font-size: 0.8rem;
// // // // //   font-weight: var(--font-weight-semibold);
// // // // //   margin-bottom: 0.5rem;
// // // // //   color: var(--color-text-secondary);
// // // // // }

// // // // // /* Attachments */
// // // // // .attachments-preview { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
// // // // // .attachment-thumb {
// // // // //   position: relative;
// // // // //   width: 60px;
// // // // //   height: 60px;
// // // // //   border-radius: var(--border-radius-sm);
// // // // //   overflow: hidden;
// // // // //   border: 1px solid var(--color-border);
// // // // // }
// // // // // .attachment-thumb img { width: 100%; height: 100%; object-fit: cover; }
// // // // // .attachment-thumb .remove-btn {
// // // // //   position: absolute; top: -5px; right: -5px;
// // // // // }

// // // // // /* --- PREVIEW PANEL --- */
// // // // // .preview-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-border); }
// // // // // .preview-date { font-size: 0.8rem; color: var(--color-text-tertiary); }
// // // // // .preview-content { padding: 1.5rem; overflow-y: auto; }
// // // // // .preview-text { white-space: pre-wrap; word-wrap: break-word; line-height: 1.6; color: var(--color-text-primary); }
// // // // // .note-tag {
// // // // //     font-size: 0.75rem; background: var(--color-primary-light);
// // // // //     color: var(--color-primary); padding: 0.2rem 0.6rem;
// // // // //     border-radius: 99px; font-weight: var(--font-weight-medium);
// // // // // }
// // // // // .attachments-gallery { margin-top: 1.5rem; }
// // // // // .gallery-title { font-size: 0.9rem; font-weight: var(--font-weight-semibold); margin-bottom: 0.75rem; }
// // // // // .gallery-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }


// // // // // /* --- PLACEHOLDER / LOADING STATES --- */
// // // // // .state-placeholder {
// // // // //   display: flex; flex-direction: column;
// // // // //   align-items: center; justify-content: center;
// // // // //   height: 100%; text-align: center;
// // // // //   gap: 0.75rem;
// // // // // }
// // // // // .placeholder-icon { font-size: 2.5rem; color: hsl(215, 20%, 88%); }
// // // // // .placeholder-text { font-size: 0.9rem; color: var(--color-text-tertiary); }
// // // // // `]
// // // // // })

// // // // // export class NotesManagerComponent implements OnInit, OnChanges {
// // // // //   private noteService = inject(NoteService);
// // // // //   private fb = inject(FormBuilder);
// // // // //   private messageService = inject(MessageService);

// // // // //   @Input() date!: CalendarDay;
  
// // // // //   // State
// // // // //   dailyNotes: Note[] = [];
// // // // //   filteredDailyNotes: Note[] = [];
// // // // //   summaries: Summary[] = [];

// // // // //   selectedNote: Note | null = null;
// // // // //   noteForm: FormGroup;
// // // // //   isEditing = false;
// // // // //   isSaving = false;
// // // // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // // // //   activeTabIndex = 0;
  
// // // // //   private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

// // // // //   constructor() {
// // // // //     this.noteForm = this.fb.group({
// // // // //       _id: [null], title: ['', Validators.required], content: ['', Validators.required],
// // // // //       tags: [[]], attachments: [[]], createdAt: [null]
// // // // //     });
// // // // //   }

// // // // //   ngOnInit(): void {
// // // // //     this.summaries = [
// // // // //         { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // // // //         { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar-minus' },
// // // // //         { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // // // //     ];
// // // // //   }

// // // // //   // Add this method to your notes-manager.component.ts
// // // // // trackNoteById(index: number, note: Note): string {
// // // // //   return note._id;
// // // // // }

// // // // //   ngOnChanges(changes: SimpleChanges): void {
// // // // //     if (changes['date'] && changes['date'].currentValue) {
// // // // //       this.activeTabIndex = 0; // Always switch back to the Day tab on date change
// // // // //       this.resetAllNotes();
// // // // //       this.loadDailyNotes();
// // // // //     }
// // // // //   }

// // // // //   refreshCurrentView(): void {
// // // // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // // // //     if (tabKey === 'day') this.loadDailyNotes();
// // // // //     if (tabKey === 'week') this.loadWeeklyNotes();
// // // // //     if (tabKey === 'month') this.loadMonthlyNotes();
// // // // //     if (tabKey === 'year') this.loadYearlyNotes();
// // // // //   }

// // // // //   onTabChange(event: any): void {
// // // // //     this.activeTabIndex = event.index;
// // // // //     const tabKey = this.activeTabIndex > 0 ? this.summaries[this.activeTabIndex - 1].key as ('week'|'month'|'year') : 'day';
    
// // // // //     // Load data only if it hasn't been loaded before for that tab
// // // // //     if (tabKey !== 'day' && !this.loadedTabs[tabKey]) {
// // // // //         this.refreshCurrentView();
// // // // //     }
// // // // //     // Reset selected note when changing tabs
// // // // //     this.selectedNote = null;
// // // // //   }

// // // // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];
  
// // // // //   isEditable(note: Note | null): boolean {
// // // // //     if (!note || !note.createdAt) return false;
// // // // //     const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
// // // // //     const todayDate = new Date().setHours(0, 0, 0, 0);
// // // // //     return noteDate === todayDate;
// // // // //   }

// // // // //   private sortNotes(notes: Note[]): Note[] {
// // // // //     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// // // // //   }

// // // // //   // --- DATA LOADING ---
// // // // //   loadDailyNotes(): void {
// // // // //     if (!this.date?.date) return;
// // // // //     this.isLoading.day = true;
// // // // //     this.startNewNote();
// // // // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // // // //       .pipe(finalize(() => { this.isLoading.day = false; }))
// // // // //       .subscribe({
// // // // //         next: (res) => {
// // // // //           this.dailyNotes = this.sortNotes(res.data.notes || []);
// // // // //           this.filteredDailyNotes = this.dailyNotes;
// // // // //         },
// // // // //         error: (err) => {
// // // // //           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// // // // //           this.isLoading.day = false;
// // // // //         }
// // // // //       });
// // // // //   }

// // // // //   loadWeeklyNotes(): void {
// // // // //     if (!this.date?.date) return;
// // // // //     this.isLoading.week = true;
// // // // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // // // //       .pipe(finalize(() => { this.isLoading.week = false; }))
// // // // //       .subscribe({
// // // // //         next: (res) => {
// // // // //           this.summaries[0].data = this.sortNotes(res.data.notes || []);
// // // // //           this.loadedTabs.week = true;
// // // // //         },
// // // // //         error: (err) => {
// // // // //           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// // // // //           this.isLoading.week = false;
// // // // //         }
// // // // //       });
// // // // //   }

// // // // //   loadMonthlyNotes(): void {
// // // // //     if (!this.date?.date) return;
// // // // //     this.isLoading.month = true;
// // // // //     const d = this.date.date;
// // // // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // // // //       .pipe(finalize(() => { this.isLoading.month = false; }))
// // // // //       .subscribe({
// // // // //         next: (res) => {
// // // // //           this.summaries[1].data = this.sortNotes(res.data.notes || []);
// // // // //           this.loadedTabs.month = true;
// // // // //         },
// // // // //         error: (err) => {
// // // // //           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// // // // //           this.isLoading.month = false;
// // // // //         }
// // // // //       });
// // // // //   }

// // // // //   loadYearlyNotes(): void {
// // // // //     if (!this.date?.date) return;
// // // // //     this.isLoading.year = true;
// // // // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // // // //       .pipe(finalize(() => { this.isLoading.year = false; }))
// // // // //       .subscribe({
// // // // //         next: (res) => {
// // // // //           this.summaries[2].data = this.sortNotes(res.data.notes || []);
// // // // //           this.loadedTabs.year = true;
// // // // //         },
// // // // //         error: (err) => {
// // // // //           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
// // // // //           this.isLoading.year = false;
// // // // //         }
// // // // //       });
// // // // //   }
  
// // // // //   filterNotes(event: Event): void {
// // // // //     const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
// // // // //     this.filteredDailyNotes = !searchTerm ? this.dailyNotes : this.dailyNotes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
// // // // //   }

// // // // //   selectNote(note: Note, event?: MouseEvent): void {
// // // // //     if (event) event.stopPropagation();
// // // // //     this.selectedNote = note;
// // // // //     this.isEditing = true;
// // // // //     this.noteForm.patchValue(note);

// // // // //     if (!this.isEditable(note)) {
// // // // //       this.noteForm.disable();
// // // // //     } else {
// // // // //       this.noteForm.enable();
// // // // //     }
// // // // //   }

// // // // //   selectForPreview(note: Note): void {
// // // // //     this.selectedNote = note;
// // // // //   }

// // // // //   startNewNote(): void {
// // // // //     this.selectedNote = null;
// // // // //     this.isEditing = false;
// // // // //     this.noteForm.enable();
// // // // //     this.noteForm.reset({
// // // // //       createdAt: this.date ? this.date.date : new Date(),
// // // // //       tags: [], attachments: []
// // // // //     });
// // // // //   }

// // // // //   saveNote(): void {
// // // // //     if (this.noteForm.invalid) return;
// // // // //     this.isSaving = true;
    
// // // // //     const formData = this.noteForm.getRawValue(); // Use getRawValue to get data from disabled form
// // // // //     const operation = this.isEditing 
// // // // //       ? this.noteService.updateNote(formData._id, formData) 
// // // // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // // // //     operation.pipe(finalize(() => this.isSaving = false)).subscribe({
// // // // //       next: (res) => {
// // // // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // // // //         this.loadDailyNotes();
// // // // //         this.selectNote(res.data.note);
// // // // //       },
// // // // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // // // //     });
// // // // //   }

// // // // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // // // //     if (event) event.stopPropagation();
// // // // //     if (!note || !this.isEditable(note)) {
// // // // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
// // // // //         return;
// // // // //     }

// // // // //     // CONFIRMATION DIALOG IS HIGHLY RECOMMENDED HERE
// // // // //     this.noteService.deleteNote(note._id).subscribe({
// // // // //       next: () => {
// // // // //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // // // //         this.loadDailyNotes();
// // // // //       },
// // // // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // // // //     });
// // // // //   }

// // // // //   onImageUploaded(url: string): void {
// // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // // // //   }

// // // // //   removeAttachment(index: number): void {
// // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // //     attachments.splice(index, 1);
// // // // //     this.noteForm.get('attachments')?.setValue(attachments);
// // // // //   }

// // // // //   private resetAllNotes(): void {
// // // // //     this.dailyNotes = [];
// // // // //     this.filteredDailyNotes = [];
// // // // //     this.summaries.forEach(s => s.data = []);
// // // // //     this.loadedTabs = { week: false, month: false, year: false };
// // // // //     this.startNewNote();
// // // // //   }
// // // // // }

// // // // // // import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
// // // // // // import { CommonModule } from '@angular/common';
// // // // // // import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // // // // import { finalize } from 'rxjs/operators';

// // // // // // // --- Your App's Modules & Components ---
// // // // // // import { ImageUploaderComponent } from './image-uploader.component';
// // // // // // import { NoteService, NoteFilterParams } from '../../core/services/notes.service';

// // // // // // // --- PrimeNG Modules for UI ---
// // // // // // import { ButtonModule } from 'primeng/button';
// // // // // // import { InputTextModule } from 'primeng/inputtext';
// // // // // // import { TextareaModule } from 'primeng/textarea';
// // // // // // import { ChipsModule } from 'primeng/chips';
// // // // // // import { ToastModule } from 'primeng/toast';
// // // // // // import { MessageService } from 'primeng/api';
// // // // // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // // // // import { TabViewModule } from 'primeng/tabview';
// // // // // // import { TooltipModule } from 'primeng/tooltip';

// // // // // // // --- Define Interfaces and Types ---
// // // // // // interface Note {
// // // // // //   _id: string;
// // // // // //   title: string;
// // // // // //   content: string;
// // // // // //   tags: string[];
// // // // // //   attachments: string[];
// // // // // //   createdAt: string;
// // // // // // }

// // // // // // interface CalendarDay {
// // // // // //   date: Date;
// // // // // // }

// // // // // // type LoadingKey = 'day' | 'week' | 'month' | 'year';

// // // // // // interface Summary {
// // // // // //   title: string;
// // // // // //   key: LoadingKey;
// // // // // //   data: Note[];
// // // // // //   icon: string;
// // // // // // }

// // // // // // @Component({
// // // // // //   selector: 'app-notes-manager',
// // // // // //   standalone: true,
// // // // // //   imports: [
// // // // // //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// // // // // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // // // // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// // // // // //   ],
// // // // // //   providers: [MessageService],
// // // // // //   template: `
// // // // // //     <p-toast></p-toast>
// // // // // //     <div class="notes-container">
// // // // // //       <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">
// // // // // //         <p-tabPanel header="Day" >
// // // // // //           <div class="notes-layout">
// // // // // //             <div class="notes-sidebar">
// // // // // //               <div class="sidebar-header">
// // // // // //                 <h2 class="section-title">Daily Notes</h2>
// // // // // //                 <div class="header-actions">
// // // // // //                   <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// // // // // //                   <button pButton icon="pi pi-plus" label="New" class="p-button-sm" (click)="startNewNote()"></button>
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //               <div class="search-bar">
// // // // // //                  <span class="p-input-icon-left">
// // // // // //                     <i class="pi pi-search"></i>
// // // // // //                     <input type="text" pInputText placeholder="Search..." class="w-full p-inputtext-sm" (input)="filterNotes($event)">
// // // // // //                  </span>
// // // // // //               </div>
// // // // // //               <div class="notes-list" *ngIf="!isLoading.day">
// // // // // //                 <div *ngIf="filteredDailyNotes.length > 0; else noDailyNotes">
// // // // // //                   <div *ngFor="let note of filteredDailyNotes" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectNote(note)">
// // // // // //                     <div class="note-card-header">
// // // // // //                       <h3 class="note-card-title">{{ note.title }}</h3>
// // // // // //                       <div class="note-card-actions" *ngIf="isEditable(note)">
// // // // // //                         <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm" (click)="selectNote(note, $event)" pTooltip="Edit Note"></button>
// // // // // //                         <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm p-button-danger" (click)="deleteNote(note, $event)" pTooltip="Delete Note"></button>
// // // // // //                       </div>
// // // // // //                     </div>
// // // // // //                     <p class="note-card-content">{{ note.content | slice:0:120 }}...</p>
// // // // // //                     <div class="note-card-tags" *ngIf="note.tags.length > 0">
// // // // // //                       <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
// // // // // //                       <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
// // // // // //                     </div>
// // // // // //                     <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
// // // // // //                       <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
// // // // // //                     </div>
// // // // // //                     <span class="note-card-date">{{ note.createdAt | date:'shortTime' }}</span>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //                 <ng-template #noDailyNotes>
// // // // // //                     <div class="empty-state"><i class="pi pi-inbox"></i><span>No notes for this day.</span></div>
// // // // // //                 </ng-template>
// // // // // //               </div>
// // // // // //               <div *ngIf="isLoading.day" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// // // // // //             </div>
// // // // // //             <div class="note-editor-panel">
// // // // // //               <form [formGroup]="noteForm" (ngSubmit)="saveNote()">
// // // // // //                 <div class="editor-header">
// // // // // //                   <h2 class="section-title">{{ isEditing ? 'Edit Note' : 'Create Note' }}</h2>
// // // // // //                   <div class="editor-actions">
// // // // // //                     <button *ngIf="isEditing" pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-outlined p-button-sm" [disabled]="!isEditable(selectedNote)" (click)="deleteNote(selectedNote)"></button>
// // // // // //                     <button pButton type="submit" label="Save" icon="pi pi-check" class="p-button-sm" [disabled]="noteForm.invalid || isSaving || (isEditing && !isEditable(selectedNote))"></button>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //                 <div class="editor-content">
// // // // // //                     <div *ngIf="isEditing && !isEditable(selectedNote)" class="read-only-banner">
// // // // // //                         <i class="pi pi-lock"></i> Notes from past days are read-only.
// // // // // //                     </div>
// // // // // //                     <div class="form-field"><input type="text" pInputText placeholder="Note Title" formControlName="title"></div>
// // // // // //                     <div class="form-field"><textarea pInputTextarea placeholder="Start writing..." formControlName="content" rows="10"></textarea></div>
// // // // // //                     <div class="form-field"><label>Tags</label><p-chips formControlName="tags" separator=","></p-chips></div>
// // // // // //                     <div class="form-field"><label>Attachments</label><app-image-uploader (uploaded)="onImageUploaded($event)"></app-image-uploader></div>
// // // // // //                     <div class="attachments-preview" *ngIf="noteForm.get('attachments')?.value.length > 0">
// // // // // //                       <div *ngFor="let url of noteForm.get('attachments')?.value; let i = index" class="attachment-thumbnail">
// // // // // //                         <img [src]="url" alt="Preview"><button type="button" class="remove-btn" (click)="removeAttachment(i)"><i class="pi pi-times"></i></button>
// // // // // //                       </div>
// // // // // //                     </div>
// // // // // //                 </div>
// // // // // //               </form>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </p-tabPanel>

// // // // // //         <p-tabPanel *ngFor="let summary of summaries; let i = index" [header]="summary.title">
// // // // // //             <div class="notes-layout">
// // // // // //               <div class="notes-sidebar">
// // // // // //                 <div class="sidebar-header">
// // // // // //                   <h2 class="section-title">{{ summary.title }} Summary</h2>
// // // // // //                   <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// // // // // //                 </div>
// // // // // //                 <div class="notes-list" *ngIf="!isLoading[summary.key]">
// // // // // //                   <div *ngIf="summary.data.length > 0; else noSummaryNotes">
// // // // // //                     <div *ngFor="let note of summary.data" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectForPreview(note)">
// // // // // //                       <div class="note-card-header">
// // // // // //                         <h3 class="note-card-title">{{ note.title }}</h3>
// // // // // //                       </div>
// // // // // //                       <p class="note-card-content">{{ note.content | slice:0:150 }}...</p>
// // // // // //                       <div class="note-card-tags" *ngIf="note.tags.length > 0">
// // // // // //                         <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
// // // // // //                         <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
// // // // // //                       </div>
// // // // // //                       <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
// // // // // //                         <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
// // // // // //                       </div>
// // // // // //                       <span class="note-card-date">{{ note.createdAt | date:'fullDate' }}</span>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                   <ng-template #noSummaryNotes>
// // // // // //                       <div class="empty-state"><i [class]="summary.icon"></i><span>No notes found for this {{ summary.key }}.</span></div>
// // // // // //                   </ng-template>
// // // // // //                 </div>
// // // // // //                 <div *ngIf="isLoading[summary.key]" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// // // // // //               </div>
// // // // // //               <div class="note-preview-panel">
// // // // // //                 <div class="preview-header">
// // // // // //                   <h2 class="section-title">Note Preview</h2>
// // // // // //                 </div>
// // // // // //                 <div class="preview-content" *ngIf="selectedNote; else noPreview">
// // // // // //                   <h3 class="preview-title">{{ selectedNote.title }}</h3>
// // // // // //                   <p class="preview-text">{{ selectedNote.content }}</p>
// // // // // //                   <div class="note-card-tags" *ngIf="selectedNote.tags.length > 0">
// // // // // //                     <label>Tags:</label>
// // // // // //                     <span *ngFor="let tag of selectedNote.tags" class="note-tag">{{ tag }}</span>
// // // // // //                   </div>
// // // // // //                   <div class="attachments-preview" *ngIf="selectedNote.attachments.length > 0">
// // // // // //                     <label>Attachments:</label>
// // // // // //                     <div *ngFor="let url of selectedNote.attachments; let i = index" class="attachment-thumbnail">
// // // // // //                       <img [src]="url" alt="Preview">
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                   <span class="note-card-date">{{ selectedNote.createdAt | date:'fullDate' }}</span>
// // // // // //                 </div>
// // // // // //                 <ng-template #noPreview>
// // // // // //                   <div class="empty-state"><i class="pi pi-file"></i><span>Select a note to preview.</span></div>
// // // // // //                 </ng-template>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //         </p-tabPanel>
// // // // // //       </p-tabView>
// // // // // //     </div>
// // // // // //   `,
// // // // // //   styles: [`
// // // // // //     :host, .notes-container { display: block; height: 100%; width: 100%; min-height: 100%; }
// // // // // //     /* Make TabView content take full height */
// // // // // //     :host ::ng-deep .p-tabview .p-tabview-panels { height: calc(100% - 45px); }
// // // // // //     :host ::ng-deep .p-tabview-panel { height: 100%; }
// // // // // //     .notes-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--spacing-md); height: 100%; }
// // // // // //     .notes-sidebar, .note-editor-panel, .note-preview-panel { background: var(--theme-bg-secondary); border-radius: var(--ui-border-radius); border: 1px solid var(--theme-border-primary); display: flex; flex-direction: column; overflow: hidden; }
// // // // // //     .sidebar-header, .editor-header, .preview-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); flex-shrink: 0; }
// // // // // //     .header-actions { display: flex; align-items: center; gap: var(--spacing-xs); }
// // // // // //     .section-title { font-family: var(--font-primary); font-size: var(--font-size-lg); font-weight: 600; color: var(--theme-text-primary); margin: 0; }
// // // // // //     .search-bar { padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); }
// // // // // //     .notes-list, .summary-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); }
// // // // // //     .loading-spinner, .empty-state { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; color: var(--theme-text-muted); padding: var(--spacing-xl); }
// // // // // //     .empty-state .pi { font-size: 2rem; margin-bottom: var(--spacing-md); }
// // // // // //     .note-card { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--ui-border-radius-sm); margin-bottom: var(--spacing-sm); cursor: pointer; transition: var(--ui-transition-fast); border: 1px solid transparent; background: var(--theme-bg-primary); position: relative; }
// // // // // //     .note-card:hover { background-color: var(--theme-hover-bg); }
// // // // // //     .note-card.active { background-color: var(--theme-accent-primary-light); border-color: var(--theme-accent-primary); }
// // // // // //     .note-card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm); }
// // // // // //     .note-card-title { font-weight: 600; font-size: var(--font-size-sm); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
// // // // // //     .note-card-content { font-size: var(--font-size-xs); color: var(--theme-text-secondary); margin: var(--spacing-xs) 0; line-height: var(--line-height-tight); }
// // // // // //     .note-card-tags { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin: var(--spacing-xs) 0; }
// // // // // //     .note-tag { background: var(--theme-accent-primary-light); color: var(--theme-accent-primary); font-size: var(--font-size-xs); padding: 0.125rem 0.5rem; border-radius: var(--ui-border-radius-full); }
// // // // // //     .note-card-attachments { margin: var(--spacing-xs) 0; }
// // // // // //     .attachment-count { font-size: var(--font-size-xs); color: var(--theme-text-muted); display: inline-flex; align-items: center; gap: var(--spacing-xs); }
// // // // // //     .note-card-date { font-size: var(--font-size-xs); color: var(--theme-text-label); font-weight: 500; }
// // // // // //     .note-card-actions { display: none; }
// // // // // //     .note-card:hover .note-card-actions { display: flex; }
// // // // // //     .note-editor-panel form { display: flex; flex-direction: column; height: 100%; }
// // // // // //     .editor-content, .preview-content { flex: 1; padding: var(--spacing-md); overflow-y: auto; }
// // // // // //     .form-field { margin-bottom: var(--spacing-md); }
// // // // // //     .form-field label { font-size: var(--font-size-xs); display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--theme-text-label); }
// // // // // //     .attachments-preview { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
// // // // // //     .attachment-thumbnail { position: relative; width: 60px; height: 60px; border-radius: var(--ui-border-radius-sm); overflow: hidden; }
// // // // // //     .attachment-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
// // // // // //     .remove-btn { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: var(--ui-transition-fast); }
// // // // // //     .attachment-thumbnail:hover .remove-btn { opacity: 1; }
// // // // // //     .read-only-banner { padding: var(--spacing-sm) var(--spacing-md); background: var(--theme-warning-light); color: var(--theme-text-secondary); font-size: var(--font-size-xs); border-radius: var(--ui-border-radius-sm); display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
// // // // // //     .preview-title { font-size: var(--font-size-lg); margin-bottom: var(--spacing-md); }
// // // // // //     .preview-text { white-space: pre-wrap; word-wrap: break-word; font-size: var(--font-size-base); line-height: var(--line-height-normal); color: var(--theme-text-primary); }
// // // // // //   `]
// // // // // // })
// // // // // // export class NotesManagerComponent implements OnInit, OnChanges {
// // // // // //   private noteService = inject(NoteService);
// // // // // //   private fb = inject(FormBuilder);
// // // // // //   private messageService = inject(MessageService);

// // // // // //   @Input() date!: CalendarDay;
  
// // // // // //   // State
// // // // // //   dailyNotes: Note[] = [];
// // // // // //   filteredDailyNotes: Note[] = [];
// // // // // //   summaries: Summary[] = [];

// // // // // //   selectedNote: Note | null = null;
// // // // // //   noteForm: FormGroup;
// // // // // //   isEditing = false;
// // // // // //   isSaving = false;
// // // // // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // // // // //   activeTabIndex = 0;
  
// // // // // //   private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

// // // // // //   constructor() {
// // // // // //     this.noteForm = this.fb.group({
// // // // // //       _id: [null], title: ['', Validators.required], content: ['', Validators.required],
// // // // // //       tags: [[]], attachments: [[]], createdAt: [null]
// // // // // //     });
// // // // // //   }

// // // // // //   ngOnInit(): void {
// // // // // //     this.summaries = [
// // // // // //         { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // // // // //         { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar-minus' },
// // // // // //         { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // // // // //     ];
// // // // // //   }

// // // // // //   ngOnChanges(changes: SimpleChanges): void {
// // // // // //     if (changes['date'] && changes['date'].currentValue) {
// // // // // //       this.activeTabIndex = 0; // Always switch back to the Day tab on date change
// // // // // //       this.resetAllNotes();
// // // // // //       this.loadDailyNotes();
// // // // // //     }
// // // // // //   }

// // // // // //   refreshCurrentView(): void {
// // // // // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // // // // //     if (tabKey === 'day') this.loadDailyNotes();
// // // // // //     if (tabKey === 'week') this.loadWeeklyNotes();
// // // // // //     if (tabKey === 'month') this.loadMonthlyNotes();
// // // // // //     if (tabKey === 'year') this.loadYearlyNotes();
// // // // // //   }

// // // // // //   onTabChange(event: any): void {
// // // // // //     this.activeTabIndex = event.index;
// // // // // //     const tabKey = this.activeTabIndex > 0 ? this.summaries[this.activeTabIndex - 1].key as ('week'|'month'|'year') : 'day';
    
// // // // // //     // Load data only if it hasn't been loaded before for that tab
// // // // // //     if (tabKey !== 'day' && !this.loadedTabs[tabKey]) {
// // // // // //         this.refreshCurrentView();
// // // // // //     }
// // // // // //     // Reset selected note when changing tabs
// // // // // //     this.selectedNote = null;
// // // // // //   }

// // // // // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];
  
// // // // // //   isEditable(note: Note | null): boolean {
// // // // // //     if (!note || !note.createdAt) return false;
// // // // // //     const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
// // // // // //     const todayDate = new Date().setHours(0, 0, 0, 0);
// // // // // //     return noteDate === todayDate;
// // // // // //   }

// // // // // //   private sortNotes(notes: Note[]): Note[] {
// // // // // //     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// // // // // //   }

// // // // // //   // --- DATA LOADING ---
// // // // // //   loadDailyNotes(): void {
// // // // // //     if (!this.date?.date) return;
// // // // // //     this.isLoading.day = true;
// // // // // //     this.startNewNote();
// // // // // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // // // // //       .pipe(finalize(() => this.isLoading.day = false))
// // // // // //       .subscribe(res => {
// // // // // //         this.dailyNotes = this.sortNotes(res.data.notes || []);
// // // // // //         this.filteredDailyNotes = this.dailyNotes;
// // // // // //       });
// // // // // //   }

// // // // // //   loadWeeklyNotes(): void {
// // // // // //     if (!this.date?.date) return;
// // // // // //     this.isLoading.week = true;
// // // // // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // // // // //       .pipe(finalize(() => this.isLoading.week = false))
// // // // // //       .subscribe(res => {
// // // // // //         this.summaries[0].data = this.sortNotes(res.data.notes || []);
// // // // // //         this.loadedTabs.week = true;
// // // // // //       });
// // // // // //   }

// // // // // //   loadMonthlyNotes(): void {
// // // // // //     if (!this.date?.date) return;
// // // // // //     this.isLoading.month = true;
// // // // // //     const d = this.date.date;
// // // // // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // // // // //       .pipe(finalize(() => this.isLoading.month = false))
// // // // // //       .subscribe(res => {
// // // // // //         this.summaries[1].data = this.sortNotes(res.data.notes || []);
// // // // // //         this.loadedTabs.month = true;
// // // // // //       });
// // // // // //   }

// // // // // //   loadYearlyNotes(): void {
// // // // // //     if (!this.date?.date) return;
// // // // // //     this.isLoading.year = true;
// // // // // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // // // // //       .pipe(finalize(() => this.isLoading.year = false))
// // // // // //       .subscribe(res => {
// // // // // //         this.summaries[2].data = this.sortNotes(res.data.notes || []);
// // // // // //         this.loadedTabs.year = true;
// // // // // //       });
// // // // // //   }
  
// // // // // //   filterNotes(event: Event): void {
// // // // // //     const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
// // // // // //     this.filteredDailyNotes = !searchTerm ? this.dailyNotes : this.dailyNotes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
// // // // // //   }

// // // // // //   selectNote(note: Note, event?: MouseEvent): void {
// // // // // //     if (event) event.stopPropagation();
// // // // // //     this.selectedNote = note;
// // // // // //     this.isEditing = true;
// // // // // //     this.noteForm.patchValue(note);

// // // // // //     if (!this.isEditable(note)) {
// // // // // //       this.noteForm.disable();
// // // // // //     } else {
// // // // // //       this.noteForm.enable();
// // // // // //     }
// // // // // //   }

// // // // // //   selectForPreview(note: Note): void {
// // // // // //     this.selectedNote = note;
// // // // // //   }

// // // // // //   startNewNote(): void {
// // // // // //     this.selectedNote = null;
// // // // // //     this.isEditing = false;
// // // // // //     this.noteForm.enable();
// // // // // //     this.noteForm.reset({
// // // // // //       createdAt: this.date ? this.date.date : new Date(),
// // // // // //       tags: [], attachments: []
// // // // // //     });
// // // // // //   }

// // // // // //   saveNote(): void {
// // // // // //     if (this.noteForm.invalid) return;
// // // // // //     this.isSaving = true;
    
// // // // // //     const formData = this.noteForm.getRawValue(); // Use getRawValue to get data from disabled form
// // // // // //     const operation = this.isEditing 
// // // // // //       ? this.noteService.updateNote(formData._id, formData) 
// // // // // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // // // // //     operation.pipe(finalize(() => this.isSaving = false)).subscribe({
// // // // // //       next: (res) => {
// // // // // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // // // // //         this.loadDailyNotes();
// // // // // //         this.selectNote(res.data.note);
// // // // // //       },
// // // // // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // // // // //     });
// // // // // //   }

// // // // // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // // // // //     if (event) event.stopPropagation();
// // // // // //     if (!note || !this.isEditable(note)) {
// // // // // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
// // // // // //         return;
// // // // // //     }

// // // // // //     // CONFIRMATION DIALOG IS HIGHLY RECOMMENDED HERE
// // // // // //     this.noteService.deleteNote(note._id).subscribe({
// // // // // //       next: () => {
// // // // // //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // // // // //         this.loadDailyNotes();
// // // // // //       },
// // // // // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // // // // //     });
// // // // // //   }

// // // // // //   onImageUploaded(url: string): void {
// // // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // // // // //   }

// // // // // //   removeAttachment(index: number): void {
// // // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // // //     attachments.splice(index, 1);
// // // // // //     this.noteForm.get('attachments')?.setValue(attachments);
// // // // // //   }

// // // // // //   private resetAllNotes(): void {
// // // // // //     this.dailyNotes = [];
// // // // // //     this.filteredDailyNotes = [];
// // // // // //     this.summaries.forEach(s => s.data = []);
// // // // // //     this.loadedTabs = { week: false, month: false, year: false };
// // // // // //     this.startNewNote();
// // // // // //   }
// // // // // // }

// // // // // // // import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
// // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // // // // // import { finalize } from 'rxjs/operators';

// // // // // // // // --- Your App's Modules & Components ---
// // // // // // // import { ImageUploaderComponent } from './image-uploader.component';
// // // // // // // import { NoteService, NoteFilterParams } from '../../core/services/notes.service';

// // // // // // // // --- PrimeNG Modules for UI ---
// // // // // // // import { ButtonModule } from 'primeng/button';
// // // // // // // import { InputTextModule } from 'primeng/inputtext';
// // // // // // // import { TextareaModule } from 'primeng/textarea';
// // // // // // // import { ChipsModule } from 'primeng/chips';
// // // // // // // import { ToastModule } from 'primeng/toast';
// // // // // // // import { MessageService } from 'primeng/api';
// // // // // // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // // // // // import { TabViewModule } from 'primeng/tabview';
// // // // // // // import { TooltipModule } from 'primeng/tooltip';

// // // // // // // // --- Define Interfaces and Types ---
// // // // // // // interface Note {
// // // // // // //   _id: string;
// // // // // // //   title: string;
// // // // // // //   content: string;
// // // // // // //   tags: string[];
// // // // // // //   attachments: string[];
// // // // // // //   createdAt: string;
// // // // // // // }

// // // // // // // interface CalendarDay {
// // // // // // //   date: Date;
// // // // // // // }

// // // // // // // type LoadingKey = 'day' | 'week' | 'month' | 'year';

// // // // // // // interface Summary {
// // // // // // //   title: string;
// // // // // // //   key: LoadingKey;
// // // // // // //   data: Note[];
// // // // // // //   icon: string;
// // // // // // // }

// // // // // // // @Component({
// // // // // // //   selector: 'app-notes-manager',
// // // // // // //   standalone: true,
// // // // // // //   imports: [
// // // // // // //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// // // // // // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // // // // // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// // // // // // //   ],
// // // // // // //   providers: [MessageService],
// // // // // // //   template: `
// // // // // // //     <p-toast></p-toast>
// // // // // // //     <div class="notes-container">
// // // // // // //       <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">
// // // // // // //         <p-tabPanel header="Day" >
// // // // // // //           <div class="notes-layout">
// // // // // // //             <div class="notes-sidebar">
// // // // // // //               <div class="sidebar-header">
// // // // // // //                 <h2 class="section-title">Daily Notes</h2>
// // // // // // //                 <div class="header-actions">
// // // // // // //                   <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// // // // // // //                   <button pButton icon="pi pi-plus" label="New" class="p-button-sm" (click)="startNewNote()"></button>
// // // // // // //                 </div>
// // // // // // //               </div>
// // // // // // //               <div class="search-bar">
// // // // // // //                  <span class="p-input-icon-left">
// // // // // // //                     <i class="pi pi-search"></i>
// // // // // // //                     <input type="text" pInputText placeholder="Search..." class="w-full p-inputtext-sm" (input)="filterNotes($event)">
// // // // // // //                  </span>
// // // // // // //               </div>
// // // // // // //               <div class="notes-list" *ngIf="!isLoading.day">
// // // // // // //                 <div *ngIf="filteredDailyNotes.length > 0; else noDailyNotes">
// // // // // // //                   <div *ngFor="let note of filteredDailyNotes" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectNote(note)">
// // // // // // //                     <div class="note-card-header">
// // // // // // //                       <h3 class="note-card-title">{{ note.title }}</h3>
// // // // // // //                       <div class="note-card-actions" *ngIf="isEditable(note)">
// // // // // // //                         <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm" (click)="selectNote(note, $event)" pTooltip="Edit Note"></button>
// // // // // // //                         <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm p-button-danger" (click)="deleteNote(note, $event)" pTooltip="Delete Note"></button>
// // // // // // //                       </div>
// // // // // // //                     </div>
// // // // // // //                     <p class="note-card-content">{{ note.content | slice:0:120 }}...</p>
// // // // // // //                     <div class="note-card-tags" *ngIf="note.tags.length > 0">
// // // // // // //                       <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
// // // // // // //                       <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
// // // // // // //                     </div>
// // // // // // //                     <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
// // // // // // //                       <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
// // // // // // //                     </div>
// // // // // // //                     <span class="note-card-date">{{ note.createdAt | date:'shortTime' }}</span>
// // // // // // //                   </div>
// // // // // // //                 </div>
// // // // // // //                 <ng-template #noDailyNotes>
// // // // // // //                     <div class="empty-state"><i class="pi pi-inbox"></i><span>No notes for this day.</span></div>
// // // // // // //                 </ng-template>
// // // // // // //               </div>
// // // // // // //               <div *ngIf="isLoading.day" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// // // // // // //             </div>
// // // // // // //             <div class="note-editor-panel">
// // // // // // //               <form [formGroup]="noteForm" (ngSubmit)="saveNote()">
// // // // // // //                 <div class="editor-header">
// // // // // // //                   <h2 class="section-title">{{ isEditing ? 'Edit Note' : 'Create Note' }}</h2>
// // // // // // //                   <div class="editor-actions">
// // // // // // //                     <button *ngIf="isEditing" pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-outlined p-button-sm" [disabled]="!isEditable(selectedNote)" (click)="deleteNote(selectedNote)"></button>
// // // // // // //                     <button pButton type="submit" label="Save" icon="pi pi-check" class="p-button-sm" [disabled]="noteForm.invalid || isSaving || (isEditing && !isEditable(selectedNote))"></button>
// // // // // // //                   </div>
// // // // // // //                 </div>
// // // // // // //                 <div class="editor-content">
// // // // // // //                     <div *ngIf="isEditing && !isEditable(selectedNote)" class="read-only-banner">
// // // // // // //                         <i class="pi pi-lock"></i> Notes from past days are read-only.
// // // // // // //                     </div>
// // // // // // //                     <div class="form-field"><input type="text" pInputText placeholder="Note Title" formControlName="title"></div>
// // // // // // //                     <div class="form-field"><textarea pInputTextarea placeholder="Start writing..." formControlName="content" rows="10"></textarea></div>
// // // // // // //                     <div class="form-field"><label>Tags</label><p-chips formControlName="tags" separator=","></p-chips></div>
// // // // // // //                     <div class="form-field"><label>Attachments</label><app-image-uploader (uploaded)="onImageUploaded($event)"></app-image-uploader></div>
// // // // // // //                     <div class="attachments-preview" *ngIf="noteForm.get('attachments')?.value.length > 0">
// // // // // // //                       <div *ngFor="let url of noteForm.get('attachments')?.value; let i = index" class="attachment-thumbnail">
// // // // // // //                         <img [src]="url" alt="Preview"><button type="button" class="remove-btn" (click)="removeAttachment(i)"><i class="pi pi-times"></i></button>
// // // // // // //                       </div>
// // // // // // //                     </div>
// // // // // // //                 </div>
// // // // // // //               </form>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         </p-tabPanel>

// // // // // // //         <p-tabPanel *ngFor="let summary of summaries" [header]="summary.title">
// // // // // // //             <div class="summary-view">
// // // // // // //                 <div class="sidebar-header">
// // // // // // //                     <h2 class="section-title">{{ summary.title }} Summary</h2>
// // // // // // //                     <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// // // // // // //                 </div>
// // // // // // //                 <div *ngIf="isLoading[summary.key]" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// // // // // // //                 <div *ngIf="!isLoading[summary.key] && summary.data.length > 0" class="summary-list">
// // // // // // //                     <div *ngFor="let note of summary.data" class="note-card">
// // // // // // //                         <h3 class="note-card-title">{{ note.title }}</h3>
// // // // // // //                         <p class="note-card-content">{{ note.content | slice:0:150 }}...</p>
// // // // // // //                         <div class="note-card-tags" *ngIf="note.tags.length > 0">
// // // // // // //                           <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
// // // // // // //                           <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
// // // // // // //                         </div>
// // // // // // //                         <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
// // // // // // //                           <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
// // // // // // //                         </div>
// // // // // // //                         <span class="note-card-date">{{ note.createdAt | date:'fullDate' }}</span>
// // // // // // //                     </div>
// // // // // // //                 </div>
// // // // // // //                 <div *ngIf="!isLoading[summary.key] && summary.data.length === 0" class="empty-state">
// // // // // // //                     <i [class]="summary.icon"></i><span>No notes found for this {{ summary.key }}.</span>
// // // // // // //                 </div>
// // // // // // //             </div>
// // // // // // //         </p-tabPanel>
// // // // // // //       </p-tabView>
// // // // // // //     </div>
// // // // // // //   `,
// // // // // // //   styles: [`
// // // // // // //     :host, .notes-container { display: block; height: 100%; width: 100%; }
// // // // // // //     /* Make TabView content take full height */
// // // // // // //     :host ::ng-deep .p-tabview .p-tabview-panels { height: calc(100% - 45px); }
// // // // // // //     :host ::ng-deep .p-tabview-panel { height: 100%; }
// // // // // // //     .notes-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--spacing-md); height: 100%; }
// // // // // // //     .notes-sidebar, .note-editor-panel { background: var(--theme-bg-secondary); border-radius: var(--ui-border-radius); border: 1px solid var(--theme-border-primary); display: flex; flex-direction: column; overflow: hidden; }
// // // // // // //     .sidebar-header, .editor-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); flex-shrink: 0; }
// // // // // // //     .header-actions { display: flex; align-items: center; gap: var(--spacing-xs); }
// // // // // // //     .section-title { font-family: var(--font-primary); font-size: var(--font-size-lg); font-weight: 600; color: var(--theme-text-primary); margin: 0; }
// // // // // // //     .search-bar { padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); }
// // // // // // //     .notes-list, .summary-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); }
// // // // // // //     .loading-spinner, .empty-state { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; color: var(--theme-text-muted); padding: var(--spacing-xl); }
// // // // // // //     .empty-state .pi { font-size: 2rem; margin-bottom: var(--spacing-md); }
// // // // // // //     .note-card { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--ui-border-radius-sm); margin-bottom: var(--spacing-sm); cursor: pointer; transition: var(--ui-transition-fast); border: 1px solid transparent; background: var(--theme-bg-primary); position: relative; }
// // // // // // //     .note-card:hover { background-color: var(--theme-hover-bg); }
// // // // // // //     .note-card.active { background-color: var(--theme-accent-primary-light); border-color: var(--theme-accent-primary); }
// // // // // // //     .note-card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm); }
// // // // // // //     .note-card-title { font-weight: 600; font-size: var(--font-size-sm); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
// // // // // // //     .note-card-content { font-size: var(--font-size-xs); color: var(--theme-text-secondary); margin: var(--spacing-xs) 0; line-height: var(--line-height-tight); }
// // // // // // //     .note-card-tags { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin: var(--spacing-xs) 0; }
// // // // // // //     .note-tag { background: var(--theme-accent-primary-light); color: var(--theme-accent-primary); font-size: var(--font-size-xs); padding: 0.125rem 0.5rem; border-radius: var(--ui-border-radius-full); }
// // // // // // //     .note-card-attachments { margin: var(--spacing-xs) 0; }
// // // // // // //     .attachment-count { font-size: var(--font-size-xs); color: var(--theme-text-muted); display: inline-flex; align-items: center; gap: var(--spacing-xs); }
// // // // // // //     .note-card-date { font-size: var(--font-size-xs); color: var(--theme-text-label); font-weight: 500; }
// // // // // // //     .note-card-actions { display: none; }
// // // // // // //     .note-card:hover .note-card-actions { display: flex; }
// // // // // // //     .note-editor-panel form, .summary-view { display: flex; flex-direction: column; height: 100%; }
// // // // // // //     .editor-content { flex: 1; padding: var(--spacing-md); overflow-y: auto; }
// // // // // // //     .form-field { margin-bottom: var(--spacing-md); }
// // // // // // //     .form-field label { font-size: var(--font-size-xs); display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--theme-text-label); }
// // // // // // //     .attachments-preview { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
// // // // // // //     .attachment-thumbnail { position: relative; width: 60px; height: 60px; border-radius: var(--ui-border-radius-sm); overflow: hidden; }
// // // // // // //     .attachment-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
// // // // // // //     .remove-btn { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: var(--ui-transition-fast); }
// // // // // // //     .attachment-thumbnail:hover .remove-btn { opacity: 1; }
// // // // // // //     .read-only-banner { padding: var(--spacing-sm) var(--spacing-md); background: var(--theme-warning-light); color: var(--theme-text-secondary); font-size: var(--font-size-xs); border-radius: var(--ui-border-radius-sm); display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
// // // // // // //   `]
// // // // // // // })
// // // // // // // export class NotesManagerComponent implements OnInit, OnChanges {
// // // // // // //   private noteService = inject(NoteService);
// // // // // // //   private fb = inject(FormBuilder);
// // // // // // //   private messageService = inject(MessageService);

// // // // // // //   @Input() date!: CalendarDay;
  
// // // // // // //   // State
// // // // // // //   dailyNotes: Note[] = [];
// // // // // // //   filteredDailyNotes: Note[] = [];
// // // // // // //   summaries: Summary[] = [];

// // // // // // //   selectedNote: Note | null = null;
// // // // // // //   noteForm: FormGroup;
// // // // // // //   isEditing = false;
// // // // // // //   isSaving = false;
// // // // // // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // // // // // //   activeTabIndex = 0;
  
// // // // // // //   private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

// // // // // // //   constructor() {
// // // // // // //     this.noteForm = this.fb.group({
// // // // // // //       _id: [null], title: ['', Validators.required], content: ['', Validators.required],
// // // // // // //       tags: [[]], attachments: [[]], createdAt: [null]
// // // // // // //     });
// // // // // // //   }

// // // // // // //   ngOnInit(): void {
// // // // // // //     this.summaries = [
// // // // // // //         { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // // // // // //         { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar-minus' },
// // // // // // //         { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // // // // // //     ];
// // // // // // //   }

// // // // // // //   ngOnChanges(changes: SimpleChanges): void {
// // // // // // //     if (changes['date'] && changes['date'].currentValue) {
// // // // // // //       this.activeTabIndex = 0; // Always switch back to the Day tab on date change
// // // // // // //       this.resetAllNotes();
// // // // // // //       this.loadDailyNotes();
// // // // // // //     }
// // // // // // //   }

// // // // // // //   refreshCurrentView(): void {
// // // // // // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // // // // // //     if (tabKey === 'day') this.loadDailyNotes();
// // // // // // //     if (tabKey === 'week') this.loadWeeklyNotes();
// // // // // // //     if (tabKey === 'month') this.loadMonthlyNotes();
// // // // // // //     if (tabKey === 'year') this.loadYearlyNotes();
// // // // // // //   }

// // // // // // //   onTabChange(event: any): void {
// // // // // // //     this.activeTabIndex = event.index;
// // // // // // //     const tabKey = this.activeTabIndex > 0 ? this.summaries[this.activeTabIndex - 1].key as ('week'|'month'|'year') : 'day';
    
// // // // // // //     // Load data only if it hasn't been loaded before for that tab
// // // // // // //     if (tabKey !== 'day' && !this.loadedTabs[tabKey]) {
// // // // // // //         this.refreshCurrentView();
// // // // // // //     }
// // // // // // //   }

// // // // // // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];
  
// // // // // // //   isEditable(note: Note | null): boolean {
// // // // // // //     if (!note || !note.createdAt) return false;
// // // // // // //     const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
// // // // // // //     const todayDate = new Date().setHours(0, 0, 0, 0);
// // // // // // //     return noteDate === todayDate;
// // // // // // //   }

// // // // // // //   // --- DATA LOADING ---
// // // // // // //   loadDailyNotes(): void {
// // // // // // //     if (!this.date?.date) return;
// // // // // // //     this.isLoading.day = true;
// // // // // // //     this.startNewNote();
// // // // // // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // // // // // //       .pipe(finalize(() => this.isLoading.day = false))
// // // // // // //       .subscribe(res => {
// // // // // // //         this.dailyNotes = res.data.notes || [];
// // // // // // //         this.filteredDailyNotes = this.dailyNotes;
// // // // // // //       });
// // // // // // //   }

// // // // // // //   loadWeeklyNotes(): void {
// // // // // // //     if (!this.date?.date) return;
// // // // // // //     this.isLoading.week = true;
// // // // // // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // // // // // //       .pipe(finalize(() => this.isLoading.week = false))
// // // // // // //       .subscribe(res => {
// // // // // // //         this.summaries[0].data = res.data.notes || [];
// // // // // // //         this.loadedTabs.week = true;
// // // // // // //       });
// // // // // // //   }

// // // // // // //   loadMonthlyNotes(): void {
// // // // // // //     if (!this.date?.date) return;
// // // // // // //     this.isLoading.month = true;
// // // // // // //     const d = this.date.date;
// // // // // // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // // // // // //       .pipe(finalize(() => this.isLoading.month = false))
// // // // // // //       .subscribe(res => {
// // // // // // //         this.summaries[1].data = res.data.notes || [];
// // // // // // //         this.loadedTabs.month = true;
// // // // // // //       });
// // // // // // //   }

// // // // // // //   loadYearlyNotes(): void {
// // // // // // //     if (!this.date?.date) return;
// // // // // // //     this.isLoading.year = true;
// // // // // // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // // // // // //       .pipe(finalize(() => this.isLoading.year = false))
// // // // // // //       .subscribe(res => {
// // // // // // //         this.summaries[2].data = res.data.notes || [];
// // // // // // //         this.loadedTabs.year = true;
// // // // // // //       });
// // // // // // //   }
  
// // // // // // //   filterNotes(event: Event): void {
// // // // // // //     const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
// // // // // // //     this.filteredDailyNotes = !searchTerm ? this.dailyNotes : this.dailyNotes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
// // // // // // //   }

// // // // // // //   selectNote(note: Note, event?: MouseEvent): void {
// // // // // // //     if (event) event.stopPropagation();
// // // // // // //     this.selectedNote = note;
// // // // // // //     this.isEditing = true;
// // // // // // //     this.noteForm.patchValue(note);

// // // // // // //     if (!this.isEditable(note)) {
// // // // // // //       this.noteForm.disable();
// // // // // // //     } else {
// // // // // // //       this.noteForm.enable();
// // // // // // //     }
// // // // // // //   }

// // // // // // //   startNewNote(): void {
// // // // // // //     this.selectedNote = null;
// // // // // // //     this.isEditing = false;
// // // // // // //     this.noteForm.enable();
// // // // // // //     this.noteForm.reset({
// // // // // // //       createdAt: this.date ? this.date.date : new Date(),
// // // // // // //       tags: [], attachments: []
// // // // // // //     });
// // // // // // //   }

// // // // // // //   saveNote(): void {
// // // // // // //     if (this.noteForm.invalid) return;
// // // // // // //     this.isSaving = true;
    
// // // // // // //     const formData = this.noteForm.getRawValue(); // Use getRawValue to get data from disabled form
// // // // // // //     const operation = this.isEditing 
// // // // // // //       ? this.noteService.updateNote(formData._id, formData) 
// // // // // // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // // // // // //     operation.pipe(finalize(() => this.isSaving = false)).subscribe({
// // // // // // //       next: (res) => {
// // // // // // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // // // // // //         this.loadDailyNotes();
// // // // // // //         this.selectNote(res.data.note);
// // // // // // //       },
// // // // // // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // // // // // //     });
// // // // // // //   }

// // // // // // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // // // // // //     if (event) event.stopPropagation();
// // // // // // //     if (!note || !this.isEditable(note)) {
// // // // // // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
// // // // // // //         return;
// // // // // // //     }

// // // // // // //     // CONFIRMATION DIALOG IS HIGHLY RECOMMENDED HERE
// // // // // // //     this.noteService.deleteNote(note._id).subscribe({
// // // // // // //       next: () => {
// // // // // // //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // // // // // //         this.loadDailyNotes();
// // // // // // //       },
// // // // // // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // // // // // //     });
// // // // // // //   }

// // // // // // //   onImageUploaded(url: string): void {
// // // // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // // // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // // // // // //   }

// // // // // // //   removeAttachment(index: number): void {
// // // // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // // // //     attachments.splice(index, 1);
// // // // // // //     this.noteForm.get('attachments')?.setValue(attachments);
// // // // // // //   }

// // // // // // //   private resetAllNotes(): void {
// // // // // // //     this.dailyNotes = [];
// // // // // // //     this.filteredDailyNotes = [];
// // // // // // //     this.summaries.forEach(s => s.data = []);
// // // // // // //     this.loadedTabs = { week: false, month: false, year: false };
// // // // // // //     this.startNewNote();
// // // // // // //   }
// // // // // // // }

// // // // // // // // import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
// // // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // // import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // // // // // // import { finalize } from 'rxjs/operators';

// // // // // // // // // --- Your App's Modules & Components ---
// // // // // // // // import { ImageUploaderComponent } from './image-uploader.component';
// // // // // // // // import { NoteService, NoteFilterParams } from '../../core/services/notes.service';

// // // // // // // // // --- PrimeNG Modules for UI ---
// // // // // // // // import { ButtonModule } from 'primeng/button';
// // // // // // // // import { InputTextModule } from 'primeng/inputtext';
// // // // // // // // import { TextareaModule } from 'primeng/textarea';
// // // // // // // // import { ChipsModule } from 'primeng/chips';
// // // // // // // // import { ToastModule } from 'primeng/toast';
// // // // // // // // import { MessageService } from 'primeng/api';
// // // // // // // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // // // // // // import { TabViewModule } from 'primeng/tabview';
// // // // // // // // import { TooltipModule } from 'primeng/tooltip';

// // // // // // // // // --- Define Interfaces and Types ---
// // // // // // // // interface Note {
// // // // // // // //   _id: string;
// // // // // // // //   title: string;
// // // // // // // //   content: string;
// // // // // // // //   tags: string[];
// // // // // // // //   attachments: string[];
// // // // // // // //   createdAt: string;
// // // // // // // // }

// // // // // // // // interface CalendarDay {
// // // // // // // //   date: Date;
// // // // // // // // }

// // // // // // // // type LoadingKey = 'day' | 'week' | 'month' | 'year';

// // // // // // // // interface Summary {
// // // // // // // //   title: string;
// // // // // // // //   key: LoadingKey;
// // // // // // // //   data: Note[];
// // // // // // // //   icon: string;
// // // // // // // // }

// // // // // // // // @Component({
// // // // // // // //   selector: 'app-notes-manager',
// // // // // // // //   standalone: true,
// // // // // // // //   imports: [
// // // // // // // //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// // // // // // // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // // // // // // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// // // // // // // //   ],
// // // // // // // //   providers: [MessageService],
// // // // // // // //   template: `
// // // // // // // //     <p-toast></p-toast>
// // // // // // // //     <div class="notes-container">
// // // // // // // //       <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">
// // // // // // // //         <p-tabPanel header="Day" >
// // // // // // // //           <div class="notes-layout">
// // // // // // // //             <div class="notes-sidebar">
// // // // // // // //               <div class="sidebar-header">
// // // // // // // //                 <h2 class="section-title">Daily Notes</h2>
// // // // // // // //                 <div class="header-actions">
// // // // // // // //                   <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// // // // // // // //                   <button pButton icon="pi pi-plus" label="New" class="p-button-sm" (click)="startNewNote()"></button>
// // // // // // // //                 </div>
// // // // // // // //               </div>
// // // // // // // //               <div class="search-bar">
// // // // // // // //                  <span class="p-input-icon-left">
// // // // // // // //                     <i class="pi pi-search"></i>
// // // // // // // //                     <input type="text" pInputText placeholder="Search..." class="w-full p-inputtext-sm" (input)="filterNotes($event)">
// // // // // // // //                  </span>
// // // // // // // //               </div>
// // // // // // // //               <div class="notes-list" *ngIf="!isLoading.day">
// // // // // // // //                 <div *ngIf="filteredDailyNotes.length > 0; else noDailyNotes">
// // // // // // // //                   <div *ngFor="let note of filteredDailyNotes" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectNote(note)">
// // // // // // // //                     <div class="note-card-header">
// // // // // // // //                       <h3 class="note-card-title">{{ note.title }}</h3>
// // // // // // // //                       <div class="note-card-actions" *ngIf="isEditable(note)">
// // // // // // // //                         <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm" (click)="selectNote(note, $event)" pTooltip="Edit Note"></button>
// // // // // // // //                         <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm p-button-danger" (click)="deleteNote(note, $event)" pTooltip="Delete Note"></button>
// // // // // // // //                       </div>
// // // // // // // //                     </div>
// // // // // // // //                     <p class="note-card-content">{{ note.content | slice:0:80 }}...</p>
// // // // // // // //                     <span class="note-card-date">{{ note.createdAt | date:'shortTime' }}</span>
// // // // // // // //                   </div>
// // // // // // // //                 </div>
// // // // // // // //                 <ng-template #noDailyNotes>
// // // // // // // //                     <div class="empty-state"><i class="pi pi-inbox"></i><span>No notes for this day.</span></div>
// // // // // // // //                 </ng-template>
// // // // // // // //               </div>
// // // // // // // //               <div *ngIf="isLoading.day" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// // // // // // // //             </div>
// // // // // // // //             <div class="note-editor-panel">
// // // // // // // //               <form [formGroup]="noteForm" (ngSubmit)="saveNote()">
// // // // // // // //                 <div class="editor-header">
// // // // // // // //                   <h2 class="section-title">{{ isEditing ? 'Edit Note' : 'Create Note' }}</h2>
// // // // // // // //                   <div class="editor-actions">
// // // // // // // //                     <button *ngIf="isEditing" pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-outlined p-button-sm" [disabled]="!isEditable(selectedNote)" (click)="deleteNote(selectedNote)"></button>
// // // // // // // //                     <button pButton type="submit" label="Save" icon="pi pi-check" class="p-button-sm" [disabled]="noteForm.invalid || isSaving || (isEditing && !isEditable(selectedNote))"></button>
// // // // // // // //                   </div>
// // // // // // // //                 </div>
// // // // // // // //                 <div class="editor-content">
// // // // // // // //                     <div *ngIf="isEditing && !isEditable(selectedNote)" class="read-only-banner">
// // // // // // // //                         <i class="pi pi-lock"></i> Notes from past days are read-only.
// // // // // // // //                     </div>
// // // // // // // //                     <div class="form-field"><input type="text" pInputText placeholder="Note Title" formControlName="title"></div>
// // // // // // // //                     <div class="form-field"><textarea pInputTextarea placeholder="Start writing..." formControlName="content" rows="8"></textarea></div>
// // // // // // // //                     <div class="form-field"><label>Tags</label><p-chips formControlName="tags" separator=","></p-chips></div>
// // // // // // // //                     <div class="form-field"><label>Attachments</label><app-image-uploader (uploaded)="onImageUploaded($event)"></app-image-uploader></div>
// // // // // // // //                     <div class="attachments-preview" *ngIf="noteForm.get('attachments')?.value.length > 0">
// // // // // // // //                       <div *ngFor="let url of noteForm.get('attachments')?.value; let i = index" class="attachment-thumbnail">
// // // // // // // //                         <img [src]="url" alt="Preview"><button type="button" class="remove-btn" (click)="removeAttachment(i)"><i class="pi pi-times"></i></button>
// // // // // // // //                       </div>
// // // // // // // //                     </div>
// // // // // // // //                 </div>
// // // // // // // //               </form>
// // // // // // // //             </div>
// // // // // // // //           </div>
// // // // // // // //         </p-tabPanel>

// // // // // // // //         <p-tabPanel *ngFor="let summary of summaries" [header]="summary.title">
// // // // // // // //             <div class="summary-view">
// // // // // // // //                 <div class="sidebar-header">
// // // // // // // //                     <h2 class="section-title">{{ summary.title }} Summary</h2>
// // // // // // // //                     <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// // // // // // // //                 </div>
// // // // // // // //                 <div *ngIf="isLoading[summary.key]" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// // // // // // // //                 <div *ngIf="!isLoading[summary.key] && summary.data.length > 0" class="summary-list">
// // // // // // // //                     <div *ngFor="let note of summary.data" class="note-card">
// // // // // // // //                         <h3 class="note-card-title">{{ note.title }}</h3>
// // // // // // // //                         <p class="note-card-content">{{ note.content | slice:0:100 }}...</p>
// // // // // // // //                         <span class="note-card-date">{{ note.createdAt | date:'fullDate' }}</span>
// // // // // // // //                     </div>
// // // // // // // //                 </div>
// // // // // // // //                 <div *ngIf="!isLoading[summary.key] && summary.data.length === 0" class="empty-state">
// // // // // // // //                     <i [class]="summary.icon"></i><span>No notes found for this {{ summary.key }}.</span>
// // // // // // // //                 </div>
// // // // // // // //             </div>
// // // // // // // //         </p-tabPanel>
// // // // // // // //       </p-tabView>
// // // // // // // //     </div>
// // // // // // // //   `,
// // // // // // // //   styles: [`
// // // // // // // //     :host, .notes-container { display: block; height: 100%; width: 100%; }
// // // // // // // //     /* Make TabView content take full height */
// // // // // // // //     :host ::ng-deep .p-tabview .p-tabview-panels { height: calc(100% - 45px); }
// // // // // // // //     :host ::ng-deep .p-tabview-panel { height: 100%; }
// // // // // // // //     .notes-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--spacing-md); height: 100%; }
// // // // // // // //     .notes-sidebar, .note-editor-panel { background: var(--theme-bg-secondary); border-radius: var(--ui-border-radius); border: 1px solid var(--theme-border-primary); display: flex; flex-direction: column; overflow: hidden; }
// // // // // // // //     .sidebar-header, .editor-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); flex-shrink: 0; }
// // // // // // // //     .header-actions { display: flex; align-items: center; gap: var(--spacing-xs); }
// // // // // // // //     .section-title { font-family: var(--font-primary); font-size: var(--font-size-lg); font-weight: 600; color: var(--theme-text-primary); margin: 0; }
// // // // // // // //     .search-bar { padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); }
// // // // // // // //     .notes-list, .summary-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); }
// // // // // // // //     .loading-spinner, .empty-state { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; color: var(--theme-text-muted); padding: var(--spacing-xl); }
// // // // // // // //     .empty-state .pi { font-size: 2rem; margin-bottom: var(--spacing-md); }
// // // // // // // //     .note-card { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--ui-border-radius-sm); margin-bottom: var(--spacing-sm); cursor: pointer; transition: var(--ui-transition-fast); border: 1px solid transparent; background: var(--theme-bg-primary); position: relative; }
// // // // // // // //     .note-card:hover { background-color: var(--theme-hover-bg); }
// // // // // // // //     .note-card.active { background-color: var(--theme-accent-primary-light); border-color: var(--theme-accent-primary); }
// // // // // // // //     .note-card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm); }
// // // // // // // //     .note-card-title { font-weight: 600; font-size: var(--font-size-sm); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
// // // // // // // //     .note-card-content { font-size: var(--font-size-xs); color: var(--theme-text-secondary); margin: var(--spacing-xs) 0; }
// // // // // // // //     .note-card-date { font-size: 0.7rem; color: var(--theme-text-label); font-weight: 500; }
// // // // // // // //     .note-card-actions { display: none; }
// // // // // // // //     .note-card:hover .note-card-actions { display: flex; }
// // // // // // // //     .note-editor-panel form, .summary-view { display: flex; flex-direction: column; height: 100%; }
// // // // // // // //     .editor-content { flex: 1; padding: var(--spacing-md); overflow-y: auto; }
// // // // // // // //     .form-field { margin-bottom: var(--spacing-md); }
// // // // // // // //     .form-field label { font-size: var(--font-size-xs); display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--theme-text-label); }
// // // // // // // //     .attachments-preview { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
// // // // // // // //     .attachment-thumbnail { position: relative; width: 60px; height: 60px; border-radius: var(--ui-border-radius-sm); overflow: hidden; }
// // // // // // // //     .attachment-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
// // // // // // // //     .remove-btn { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: var(--ui-transition-fast); }
// // // // // // // //     .attachment-thumbnail:hover .remove-btn { opacity: 1; }
// // // // // // // //     .read-only-banner { padding: var(--spacing-sm) var(--spacing-md); background: var(--theme-warning-light); color: var(--theme-text-secondary); font-size: var(--font-size-xs); border-radius: var(--ui-border-radius-sm); display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
// // // // // // // //   `]
// // // // // // // // })
// // // // // // // // export class NotesManagerComponent implements OnInit, OnChanges {
// // // // // // // //   private noteService = inject(NoteService);
// // // // // // // //   private fb = inject(FormBuilder);
// // // // // // // //   private messageService = inject(MessageService);

// // // // // // // //   @Input() date!: CalendarDay;
  
// // // // // // // //   // State
// // // // // // // //   dailyNotes: Note[] = [];
// // // // // // // //   filteredDailyNotes: Note[] = [];
// // // // // // // //   summaries: Summary[] = [];

// // // // // // // //   selectedNote: Note | null = null;
// // // // // // // //   noteForm: FormGroup;
// // // // // // // //   isEditing = false;
// // // // // // // //   isSaving = false;
// // // // // // // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // // // // // // //   activeTabIndex = 0;
  
// // // // // // // //   private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

// // // // // // // //   constructor() {
// // // // // // // //     this.noteForm = this.fb.group({
// // // // // // // //       _id: [null], title: ['', Validators.required], content: ['', Validators.required],
// // // // // // // //       tags: [[]], attachments: [[]], createdAt: [null]
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   ngOnInit(): void {
// // // // // // // //     this.summaries = [
// // // // // // // //         { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // // // // // // //         { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar-minus' },
// // // // // // // //         { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // // // // // // //     ];
// // // // // // // //   }

// // // // // // // //   ngOnChanges(changes: SimpleChanges): void {
// // // // // // // //     if (changes['date'] && changes['date'].currentValue) {
// // // // // // // //       this.activeTabIndex = 0; // Always switch back to the Day tab on date change
// // // // // // // //       this.resetAllNotes();
// // // // // // // //       this.loadDailyNotes();
// // // // // // // //     }
// // // // // // // //   }

// // // // // // // //   refreshCurrentView(): void {
// // // // // // // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // // // // // // //     if (tabKey === 'day') this.loadDailyNotes();
// // // // // // // //     if (tabKey === 'week') this.loadWeeklyNotes();
// // // // // // // //     if (tabKey === 'month') this.loadMonthlyNotes();
// // // // // // // //     if (tabKey === 'year') this.loadYearlyNotes();
// // // // // // // //   }

// // // // // // // //   onTabChange(event: any): void {
// // // // // // // //     this.activeTabIndex = event.index;
// // // // // // // //     const tabKey = this.activeTabIndex > 0 ? this.summaries[this.activeTabIndex - 1].key as ('week'|'month'|'year') : 'day';
    
// // // // // // // //     // Load data only if it hasn't been loaded before for that tab
// // // // // // // //     if (tabKey !== 'day' && !this.loadedTabs[tabKey]) {
// // // // // // // //         this.refreshCurrentView();
// // // // // // // //     }
// // // // // // // //   }

// // // // // // // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];
  
// // // // // // // //   isEditable(note: Note | null): boolean {
// // // // // // // //     if (!note || !note.createdAt) return false;
// // // // // // // //     const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
// // // // // // // //     const todayDate = new Date().setHours(0, 0, 0, 0);
// // // // // // // //     return noteDate === todayDate;
// // // // // // // //   }

// // // // // // // //   // --- DATA LOADING ---
// // // // // // // //   loadDailyNotes(): void {
// // // // // // // //     if (!this.date?.date) return;
// // // // // // // //     this.isLoading.day = true;
// // // // // // // //     this.startNewNote();
// // // // // // // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // // // // // // //       .pipe(finalize(() => this.isLoading.day = false))
// // // // // // // //       .subscribe(res => {
// // // // // // // //         this.dailyNotes = res.data.notes || [];
// // // // // // // //         this.filteredDailyNotes = this.dailyNotes;
// // // // // // // //       });
// // // // // // // //   }

// // // // // // // //   loadWeeklyNotes(): void {
// // // // // // // //     if (!this.date?.date) return;
// // // // // // // //     this.isLoading.week = true;
// // // // // // // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // // // // // // //       .pipe(finalize(() => this.isLoading.week = false))
// // // // // // // //       .subscribe(res => {
// // // // // // // //         this.summaries[0].data = res.data.notes || [];
// // // // // // // //         this.loadedTabs.week = true;
// // // // // // // //       });
// // // // // // // //   }

// // // // // // // //   loadMonthlyNotes(): void {
// // // // // // // //     if (!this.date?.date) return;
// // // // // // // //     this.isLoading.month = true;
// // // // // // // //     const d = this.date.date;
// // // // // // // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // // // // // // //       .pipe(finalize(() => this.isLoading.month = false))
// // // // // // // //       .subscribe(res => {
// // // // // // // //         this.summaries[1].data = res.data.notes || [];
// // // // // // // //         this.loadedTabs.month = true;
// // // // // // // //       });
// // // // // // // //   }

// // // // // // // //   loadYearlyNotes(): void {
// // // // // // // //     if (!this.date?.date) return;
// // // // // // // //     this.isLoading.year = true;
// // // // // // // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // // // // // // //       .pipe(finalize(() => this.isLoading.year = false))
// // // // // // // //       .subscribe(res => {
// // // // // // // //         this.summaries[2].data = res.data.notes || [];
// // // // // // // //         this.loadedTabs.year = true;
// // // // // // // //       });
// // // // // // // //   }
  
// // // // // // // //   filterNotes(event: Event): void {
// // // // // // // //     const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
// // // // // // // //     this.filteredDailyNotes = !searchTerm ? this.dailyNotes : this.dailyNotes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
// // // // // // // //   }

// // // // // // // //   selectNote(note: Note, event?: MouseEvent): void {
// // // // // // // //     if (event) event.stopPropagation();
// // // // // // // //     this.selectedNote = note;
// // // // // // // //     this.isEditing = true;
// // // // // // // //     this.noteForm.patchValue(note);

// // // // // // // //     if (!this.isEditable(note)) {
// // // // // // // //       this.noteForm.disable();
// // // // // // // //     } else {
// // // // // // // //       this.noteForm.enable();
// // // // // // // //     }
// // // // // // // //   }

// // // // // // // //   startNewNote(): void {
// // // // // // // //     this.selectedNote = null;
// // // // // // // //     this.isEditing = false;
// // // // // // // //     this.noteForm.enable();
// // // // // // // //     this.noteForm.reset({
// // // // // // // //       createdAt: this.date ? this.date.date : new Date(),
// // // // // // // //       tags: [], attachments: []
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   saveNote(): void {
// // // // // // // //     if (this.noteForm.invalid) return;
// // // // // // // //     this.isSaving = true;
    
// // // // // // // //     const formData = this.noteForm.getRawValue(); // Use getRawValue to get data from disabled form
// // // // // // // //     const operation = this.isEditing 
// // // // // // // //       ? this.noteService.updateNote(formData._id, formData) 
// // // // // // // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // // // // // // //     operation.pipe(finalize(() => this.isSaving = false)).subscribe({
// // // // // // // //       next: (res) => {
// // // // // // // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // // // // // // //         this.loadDailyNotes();
// // // // // // // //         this.selectNote(res.data.note);
// // // // // // // //       },
// // // // // // // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // // // // // // //     if (event) event.stopPropagation();
// // // // // // // //     if (!note || !this.isEditable(note)) {
// // // // // // // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
// // // // // // // //         return;
// // // // // // // //     }

// // // // // // // //     // CONFIRMATION DIALOG IS HIGHLY RECOMMENDED HERE
// // // // // // // //     this.noteService.deleteNote(note._id).subscribe({
// // // // // // // //       next: () => {
// // // // // // // //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // // // // // // //         this.loadDailyNotes();
// // // // // // // //       },
// // // // // // // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   onImageUploaded(url: string): void {
// // // // // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // // // // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // // // // // // //   }

// // // // // // // //   removeAttachment(index: number): void {
// // // // // // // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // // // // // // //     attachments.splice(index, 1);
// // // // // // // //     this.noteForm.get('attachments')?.setValue(attachments);
// // // // // // // //   }

// // // // // // // //   private resetAllNotes(): void {
// // // // // // // //     this.dailyNotes = [];
// // // // // // // //     this.filteredDailyNotes = [];
// // // // // // // //     this.summaries.forEach(s => s.data = []);
// // // // // // // //     this.loadedTabs = { week: false, month: false, year: false };
// // // // // // // //     this.startNewNote();
// // // // // // // //   }
// // // // // // // // }
