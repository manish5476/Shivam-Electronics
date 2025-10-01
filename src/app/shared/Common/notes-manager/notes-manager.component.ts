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

  // UPDATED: Helper method to get summary data safely
  getSummaryData(key: SummaryKey): Note[] {
    const summary = this.summaries.find(s => s.key === key);
    return summary ? summary.data : [];
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
        this.cdr.markForCheck(); // UPDATED: Mark for check after data update
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
        this.cdr.markForCheck();
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
        const summary = this.summaries.find(s => s.key === 'week');
        if (summary) {
          summary.data = this.sortNotes(res.data.notes || []);
        }
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
        const summary = this.summaries.find(s => s.key === 'month');
        if (summary) {
          summary.data = this.sortNotes(res.data.notes || []);
        }
        this.loadedTabs.month = true;
      }));
  }

  loadYearlyNotes(): void {
    if (!this.date?.date) return;
    this.updateLoadingState('year', true);
    this.noteService.getNotes({ year: this.date.date.getFullYear() })
      .pipe(finalize(() => this.updateLoadingState('year', false)))
      .subscribe(this.createDataHandler(res => {
        const summary = this.summaries.find(s => s.key === 'year');
        if (summary) {
          summary.data = this.sortNotes(res.data.notes || []);
        }
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
      const summaryKey = this.activeTabValue as SummaryKey;
      if (!this.loadedTabs[summaryKey]) {
        this.refreshCurrentView();
      } else {
        this.cdr.markForCheck(); // UPDATED: Ensure view updates if already loaded
      }
    }
  }

  selectNote(note: Note): void {
    this.selectedNote = note;
    this.isEditing = true;
    this.noteForm.reset(note);
    this.isEditable(note) ? this.noteForm.enable() : this.noteForm.disable();
    this.cdr.markForCheck();
  }

  selectForPreview(note: Note): void {
    this.selectedNote = note;
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
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

  // UPDATED: New method for editing from summary note cards
  editNoteFromCard(note: Note, event: MouseEvent): void {
    event.stopPropagation();
    this.editNoteFromPreview(note);
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
    this.cdr.markForCheck();
  }

  removeAttachment(index: number): void {
    const attachments = [...this.noteForm.get('attachments')?.value || []];
    attachments.splice(index, 1);
    this.noteForm.get('attachments')?.setValue(attachments);
    this.cdr.markForCheck();
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
// import { AutoCompleteModule } from 'primeng/autocomplete';
// import { ToastModule } from 'primeng/toast';
// import { MessageService, ConfirmationService } from 'primeng/api';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { TooltipModule } from 'primeng/tooltip';
// import { ImageModule } from 'primeng/image';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { TabsModule } from 'primeng/tabs'; // IMPORT the specific event type

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
  
//   /**
//    * CORRECTED: Use the specific TabsChangeEvent type for the event parameter.
//    */
//   onTabChange(event: any): void {
//     console.log(event);
//     this.activeTabValue = event.value as LoadingKey;
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
//         this.refreshCurrentView();
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

//   // UPDATED: New method for editing from summary note cards
//   editNoteFromCard(note: Note, event: MouseEvent): void {
//     event.stopPropagation();
//     this.editNoteFromPreview(note);
//   }

//   editNoteFromPreview(note: Note | null): void {
//     if (!note) return;
//     this.date = { date: new Date(note.createdAt) };
//     this._noteToSelectAfterLoad = note._id;
//     this.activeTabValue = 'day';
//     this.loadDailyNotes();
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
// // import { AutoCompleteModule } from 'primeng/autocomplete';
// // import { ToastModule } from 'primeng/toast';
// // import { MessageService, ConfirmationService } from 'primeng/api';
// // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // import { TooltipModule } from 'primeng/tooltip';
// // import { ImageModule } from 'primeng/image';
// // import { ConfirmDialogModule } from 'primeng/confirmdialog';
// // import { TabsModule } from 'primeng/tabs'; // IMPORT the specific event type

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
// //   selectedNote: Note | any
// //   noteForm: FormGroup;
// //   searchControl = new FormControl('');
// //   isEditing = false;
// //   isSaving = false;
// //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// //   activeTabValue: LoadingKey = 'day';
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
// //     if (changes['date']?.currentValue && !this._noteToSelectAfterLoad) {
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
  
// //   /**
// //    * CORRECTED: Use the specific TabsChangeEvent type for the event parameter.
// //    */
// //   onTabChange(event: any): void {
// //     console.log(event);
// //     this.activeTabValue = event.value as LoadingKey;
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
// //         this.refreshCurrentView();
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
// //                 this.selectedNote = null;
// //                 this.refreshCurrentView();
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
// //     this.loadDailyNotes();
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