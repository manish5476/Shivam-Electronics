import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// --- Your App's Modules & Components ---
import { ImageUploaderComponent } from './image-uploader.component';
import { NoteService, NoteFilterParams } from '../../core/services/notes.service';

// --- PrimeNG Modules for UI ---
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ChipsModule } from 'primeng/chips';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

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

interface Summary {
  title: string;
  key: LoadingKey;
  data: Note[];
  icon: string;
}

@Component({
  selector: 'app-notes-manager',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ImageUploaderComponent,
    ButtonModule, InputTextModule, TextareaModule, ChipsModule,
    ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="notes-container">
      <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">
        <p-tabPanel header="Day" >
          <div class="notes-layout">
            <div class="notes-sidebar">
              <div class="sidebar-header">
                <h2 class="section-title">Daily Notes</h2>
                <div class="header-actions">
                  <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
                  <button pButton icon="pi pi-plus" label="New" class="p-button-sm" (click)="startNewNote()"></button>
                </div>
              </div>
              <div class="search-bar">
                 <span class="p-input-icon-left">
                    <i class="pi pi-search"></i>
                    <input type="text" pInputText placeholder="Search..." class="w-full p-inputtext-sm" (input)="filterNotes($event)">
                 </span>
              </div>
              <div class="notes-list" *ngIf="!isLoading.day; else loadingTemplate">
                <div *ngIf="filteredDailyNotes.length > 0; else noDailyNotes">
                  <div *ngFor="let note of filteredDailyNotes" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectNote(note)">
                    <div class="note-card-header">
                      <h3 class="note-card-title">{{ note.title }}</h3>
                      <div class="note-card-actions" *ngIf="isEditable(note)">
                        <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm" (click)="selectNote(note, $event)" pTooltip="Edit Note"></button>
                        <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm p-button-danger" (click)="deleteNote(note, $event)" pTooltip="Delete Note"></button>
                      </div>
                    </div>
                    <p class="note-card-content">{{ note.content | slice:0:120 }}...</p>
                    <div class="note-card-tags" *ngIf="note.tags.length > 0">
                      <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
                      <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
                    </div>
                    <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
                      <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
                    </div>
                    <span class="note-card-date">{{ note.createdAt | date:'shortTime' }}</span>
                  </div>
                </div>
                <ng-template #noDailyNotes>
                    <div class="empty-state"><i class="pi pi-inbox"></i><span>No notes for this day.</span></div>
                </ng-template>
              </div>
              <ng-template #loadingTemplate>
                <div class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
              </ng-template>
            </div>
            <div class="note-editor-panel">
              <form [formGroup]="noteForm" (ngSubmit)="saveNote()">
                <div class="editor-header">
                  <h2 class="section-title">{{ isEditing ? 'Edit Note' : 'Create Note' }}</h2>
                  <div class="editor-actions">
                    <button *ngIf="isEditing" pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-outlined p-button-sm" [disabled]="!isEditable(selectedNote)" (click)="deleteNote(selectedNote)"></button>
                  </div>
                </div>
                <div class="editor-content">
                    <div *ngIf="isEditing && !isEditable(selectedNote)" class="read-only-banner">
                        <i class="pi pi-lock"></i> Notes from past days are read-only.
                    </div>
                    <div class="form-row">
                      <div class="form-field flex-1"><input type="text" pInputText placeholder="Note Title" formControlName="title"></div>
                      <div class="form-field flex-1"><label>Attachments</label><app-image-uploader (uploaded)="onImageUploaded($event)"></app-image-uploader></div>
                    </div>
                    <div class="form-row">
                      <div class="form-field flex-1"><label>Tags</label><p-chips formControlName="tags" separator=","></p-chips></div>
                      <button pButton type="submit" label="Save" icon="pi pi-check" class="p-button-sm save-button" [disabled]="noteForm.invalid || isSaving || (isEditing && !isEditable(selectedNote))"></button>
                    </div>
                    <div class="attachments-preview" *ngIf="noteForm.get('attachments')?.value.length > 0">
                      <div *ngFor="let url of noteForm.get('attachments')?.value; let i = index" class="attachment-thumbnail">
                        <img [src]="url" alt="Preview"><button type="button" class="remove-btn" (click)="removeAttachment(i)"><i class="pi pi-times"></i></button>
                      </div>
                    </div>
                    <div class="form-field content-field"><textarea pInputTextarea placeholder="Start writing..." formControlName="content" rows="10"></textarea></div>
                </div>
              </form>
            </div>
          </div>
        </p-tabPanel>

        <p-tabPanel *ngFor="let summary of summaries; let i = index" [header]="summary.title">
            <div class="notes-layout">
              <div class="notes-sidebar">
                <div class="sidebar-header">
                  <h2 class="section-title">{{ summary.title }} Summary</h2>
                  <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
                </div>
                <div class="notes-list" *ngIf="!isLoading[summary.key]; else loadingTemplate">
                  <div *ngIf="summary.data.length > 0; else noSummaryNotes">
                    <div *ngFor="let note of summary.data" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectForPreview(note)">
                      <div class="note-card-header">
                        <h3 class="note-card-title">{{ note.title }}</h3>
                      </div>
                      <p class="note-card-content">{{ note.content | slice:0:150 }}...</p>
                      <div class="note-card-tags" *ngIf="note.tags.length > 0">
                        <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
                        <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
                      </div>
                      <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
                        <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
                      </div>
                      <span class="note-card-date">{{ note.createdAt | date:'fullDate' }}</span>
                    </div>
                  </div>
                  <ng-template #noSummaryNotes>
                      <div class="empty-state"><i [class]="summary.icon"></i><span>No notes found for this {{ summary.key }}.</span></div>
                  </ng-template>
                </div>
                <ng-template #loadingTemplate>
                  <div class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
                </ng-template>
              </div>
              <div class="note-preview-panel">
                <div class="preview-header">
                  <h2 class="section-title">Note Preview</h2>
                </div>
                <div class="preview-content" *ngIf="selectedNote; else noPreview">
                  <h3 class="preview-title">{{ selectedNote.title }}</h3>
                  <p class="preview-text">{{ selectedNote.content }}</p>
                  <div class="note-card-tags" *ngIf="selectedNote.tags.length > 0">
                    <label>Tags:</label>
                    <span *ngFor="let tag of selectedNote.tags" class="note-tag">{{ tag }}</span>
                  </div>
                  <div class="attachments-preview" *ngIf="selectedNote.attachments.length > 0">
                    <label>Attachments:</label>
                    <div *ngFor="let url of selectedNote.attachments; let i = index" class="attachment-thumbnail">
                      <img [src]="url" alt="Preview">
                    </div>
                  </div>
                  <span class="note-card-date">{{ selectedNote.createdAt | date:'fullDate' }}</span>
                </div>
                <ng-template #noPreview>
                  <div class="empty-state"><i class="pi pi-file"></i><span>Select a note to preview.</span></div>
                </ng-template>
              </div>
            </div>
        </p-tabPanel>
      </p-tabView>
    </div>
  `,
  styles: [`
    :host, .notes-container { display: block; height: 100%; width: 100%; min-height: 100%; }
    /* Make TabView content take full height */
    :host ::ng-deep .p-tabview .p-tabview-panels { height: calc(100% - 45px); }
    :host ::ng-deep .p-tabview-panel { height: 100%; }
    .notes-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--spacing-md); height: 100%; }
    .notes-sidebar, .note-editor-panel, .note-preview-panel { background: var(--theme-bg-secondary); border-radius: var(--ui-border-radius); border: 1px solid var(--theme-border-primary); display: flex; flex-direction: column; overflow: hidden; }
    .sidebar-header, .editor-header, .preview-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); flex-shrink: 0; }
    .header-actions { display: flex; align-items: center; gap: var(--spacing-xs); }
    .section-title { font-family: var(--font-primary); font-size: var(--font-size-lg); font-weight: 600; color: var(--theme-text-primary); margin: 0; }
    .search-bar { padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); }
    .notes-list, .summary-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); }
    .loading-spinner, .empty-state { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; color: var(--theme-text-muted); padding: var(--spacing-xl); }
    .empty-state .pi { font-size: 2rem; margin-bottom: var(--spacing-md); }
    .note-card { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--ui-border-radius-sm); margin-bottom: var(--spacing-sm); cursor: pointer; transition: var(--ui-transition-fast); border: 1px solid transparent; background: var(--theme-bg-primary); position: relative; }
    .note-card:hover { background-color: var(--theme-hover-bg); }
    .note-card.active { background-color: var(--theme-accent-primary-light); border-color: var(--theme-accent-primary); }
    .note-card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm); }
    .note-card-title { font-weight: 600; font-size: var(--font-size-sm); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
    .note-card-content { font-size: var(--font-size-xs); color: var(--theme-text-secondary); margin: var(--spacing-xs) 0; line-height: var(--line-height-tight); }
    .note-card-tags { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin: var(--spacing-xs) 0; }
    .note-tag { background: var(--theme-accent-primary-light); color: var(--theme-accent-primary); font-size: var(--font-size-xs); padding: 0.125rem 0.5rem; border-radius: var(--ui-border-radius-full); }
    .note-card-attachments { margin: var(--spacing-xs) 0; }
    .attachment-count { font-size: var(--font-size-xs); color: var(--theme-text-muted); display: inline-flex; align-items: center; gap: var(--spacing-xs); }
    .note-card-date { font-size: var(--font-size-xs); color: var(--theme-text-label); font-weight: 500; }
    .note-card-actions { display: none; }
    .note-card:hover .note-card-actions { display: flex; }
    .note-editor-panel form { display: flex; flex-direction: column; height: 100%; }
    .editor-content, .preview-content { flex: 1; padding: var(--spacing-md); overflow-y: auto; display: flex; flex-direction: column; gap: var(--spacing-md); }
    .form-row { display: flex; gap: var(--spacing-md); align-items: flex-end; }
    .form-field { margin-bottom: 0; flex: 1; }
    .form-field label { font-size: var(--font-size-xs); display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--theme-text-label); }
    .save-button { height: fit-content; align-self: flex-end; }
    .content-field { flex: 1; }
    .content-field textarea { height: 100%; }
    .attachments-preview { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); }
    .attachment-thumbnail { position: relative; width: 60px; height: 60px; border-radius: var(--ui-border-radius-sm); overflow: hidden; }
    .attachment-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
    .remove-btn { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: var(--ui-transition-fast); }
    .attachment-thumbnail:hover .remove-btn { opacity: 1; }
    .read-only-banner { padding: var(--spacing-sm) var(--spacing-md); background: var(--theme-warning-light); color: var(--theme-text-secondary); font-size: var(--font-size-xs); border-radius: var(--ui-border-radius-sm); display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
    .preview-title { font-size: var(--font-size-lg); margin-bottom: var(--spacing-md); }
    .preview-text { white-space: pre-wrap; word-wrap: break-word; font-size: var(--font-size-base); line-height: var(--line-height-normal); color: var(--theme-text-primary); }
  `]
})
export class NotesManagerComponent implements OnInit, OnChanges {
  private noteService = inject(NoteService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  @Input() date!: CalendarDay;
  
  // State
  dailyNotes: Note[] = [];
  filteredDailyNotes: Note[] = [];
  summaries: Summary[] = [];

  selectedNote: Note | null = null;
  noteForm: FormGroup;
  isEditing = false;
  isSaving = false;
  isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
  activeTabIndex = 0;
  
  private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

  constructor() {
    this.noteForm = this.fb.group({
      _id: [null], title: ['', Validators.required], content: ['', Validators.required],
      tags: [[]], attachments: [[]], createdAt: [null]
    });
  }

  ngOnInit(): void {
    this.summaries = [
        { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
        { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar-minus' },
        { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && changes['date'].currentValue) {
      this.activeTabIndex = 0; // Always switch back to the Day tab on date change
      this.resetAllNotes();
      this.loadDailyNotes();
    }
  }

  refreshCurrentView(): void {
    const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
    if (tabKey === 'day') this.loadDailyNotes();
    if (tabKey === 'week') this.loadWeeklyNotes();
    if (tabKey === 'month') this.loadMonthlyNotes();
    if (tabKey === 'year') this.loadYearlyNotes();
  }

  onTabChange(event: any): void {
    this.activeTabIndex = event.index;
    const tabKey = this.activeTabIndex > 0 ? this.summaries[this.activeTabIndex - 1].key as ('week'|'month'|'year') : 'day';
    
    // Load data only if it hasn't been loaded before for that tab
    if (tabKey !== 'day' && !this.loadedTabs[tabKey]) {
        this.refreshCurrentView();
    }
    // Reset selected note when changing tabs
    this.selectedNote = null;
  }

  private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];
  
  isEditable(note: Note | null): boolean {
    if (!note || !note.createdAt) return false;
    const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
    const todayDate = new Date().setHours(0, 0, 0, 0);
    return noteDate === todayDate;
  }

  private sortNotes(notes: Note[]): Note[] {
    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- DATA LOADING ---
  loadDailyNotes(): void {
    if (!this.date?.date) return;
    this.isLoading.day = true;
    this.startNewNote();
    this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
      .pipe(finalize(() => { this.isLoading.day = false; }))
      .subscribe({
        next: (res) => {
          this.dailyNotes = this.sortNotes(res.data.notes || []);
          this.filteredDailyNotes = this.dailyNotes;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
          this.isLoading.day = false;
        }
      });
  }

  loadWeeklyNotes(): void {
    if (!this.date?.date) return;
    this.isLoading.week = true;
    this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
      .pipe(finalize(() => { this.isLoading.week = false; }))
      .subscribe({
        next: (res) => {
          this.summaries[0].data = this.sortNotes(res.data.notes || []);
          this.loadedTabs.week = true;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
          this.isLoading.week = false;
        }
      });
  }

  loadMonthlyNotes(): void {
    if (!this.date?.date) return;
    this.isLoading.month = true;
    const d = this.date.date;
    this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
      .pipe(finalize(() => { this.isLoading.month = false; }))
      .subscribe({
        next: (res) => {
          this.summaries[1].data = this.sortNotes(res.data.notes || []);
          this.loadedTabs.month = true;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
          this.isLoading.month = false;
        }
      });
  }

  loadYearlyNotes(): void {
    if (!this.date?.date) return;
    this.isLoading.year = true;
    this.noteService.getNotes({ year: this.date.date.getFullYear() })
      .pipe(finalize(() => { this.isLoading.year = false; }))
      .subscribe({
        next: (res) => {
          this.summaries[2].data = this.sortNotes(res.data.notes || []);
          this.loadedTabs.year = true;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes.' });
          this.isLoading.year = false;
        }
      });
  }
  
  filterNotes(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredDailyNotes = !searchTerm ? this.dailyNotes : this.dailyNotes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
  }

  selectNote(note: Note, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.selectedNote = note;
    this.isEditing = true;
    this.noteForm.patchValue(note);

    if (!this.isEditable(note)) {
      this.noteForm.disable();
    } else {
      this.noteForm.enable();
    }
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
      tags: [], attachments: []
    });
  }

  saveNote(): void {
    if (this.noteForm.invalid) return;
    this.isSaving = true;
    
    const formData = this.noteForm.getRawValue(); // Use getRawValue to get data from disabled form
    const operation = this.isEditing 
      ? this.noteService.updateNote(formData._id, formData) 
      : this.noteService.createNote({ ...formData, createdAt: this.date.date });

    operation.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
        this.loadDailyNotes();
        this.selectNote(res.data.note);
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
    });
  }

  deleteNote(note: Note | null, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (!note || !this.isEditable(note)) {
        this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
        return;
    }

    // CONFIRMATION DIALOG IS HIGHLY RECOMMENDED HERE
    this.noteService.deleteNote(note._id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
        this.loadDailyNotes();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
    });
  }

  onImageUploaded(url: string): void {
    const attachments = this.noteForm.get('attachments')?.value || [];
    this.noteForm.get('attachments')?.setValue([...attachments, url]);
  }

  removeAttachment(index: number): void {
    const attachments = this.noteForm.get('attachments')?.value || [];
    attachments.splice(index, 1);
    this.noteForm.get('attachments')?.setValue(attachments);
  }

  private resetAllNotes(): void {
    this.dailyNotes = [];
    this.filteredDailyNotes = [];
    this.summaries.forEach(s => s.data = []);
    this.loadedTabs = { week: false, month: false, year: false };
    this.startNewNote();
  }
}

// import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { finalize } from 'rxjs/operators';

// // --- Your App's Modules & Components ---
// import { ImageUploaderComponent } from './image-uploader.component';
// import { NoteService, NoteFilterParams } from '../../core/services/notes.service';

// // --- PrimeNG Modules for UI ---
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { TextareaModule } from 'primeng/textarea';
// import { ChipsModule } from 'primeng/chips';
// import { ToastModule } from 'primeng/toast';
// import { MessageService } from 'primeng/api';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { TabViewModule } from 'primeng/tabview';
// import { TooltipModule } from 'primeng/tooltip';

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

// interface Summary {
//   title: string;
//   key: LoadingKey;
//   data: Note[];
//   icon: string;
// }

// @Component({
//   selector: 'app-notes-manager',
//   standalone: true,
//   imports: [
//     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
//     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
//     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
//   ],
//   providers: [MessageService],
//   template: `
//     <p-toast></p-toast>
//     <div class="notes-container">
//       <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">
//         <p-tabPanel header="Day" >
//           <div class="notes-layout">
//             <div class="notes-sidebar">
//               <div class="sidebar-header">
//                 <h2 class="section-title">Daily Notes</h2>
//                 <div class="header-actions">
//                   <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
//                   <button pButton icon="pi pi-plus" label="New" class="p-button-sm" (click)="startNewNote()"></button>
//                 </div>
//               </div>
//               <div class="search-bar">
//                  <span class="p-input-icon-left">
//                     <i class="pi pi-search"></i>
//                     <input type="text" pInputText placeholder="Search..." class="w-full p-inputtext-sm" (input)="filterNotes($event)">
//                  </span>
//               </div>
//               <div class="notes-list" *ngIf="!isLoading.day">
//                 <div *ngIf="filteredDailyNotes.length > 0; else noDailyNotes">
//                   <div *ngFor="let note of filteredDailyNotes" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectNote(note)">
//                     <div class="note-card-header">
//                       <h3 class="note-card-title">{{ note.title }}</h3>
//                       <div class="note-card-actions" *ngIf="isEditable(note)">
//                         <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm" (click)="selectNote(note, $event)" pTooltip="Edit Note"></button>
//                         <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm p-button-danger" (click)="deleteNote(note, $event)" pTooltip="Delete Note"></button>
//                       </div>
//                     </div>
//                     <p class="note-card-content">{{ note.content | slice:0:120 }}...</p>
//                     <div class="note-card-tags" *ngIf="note.tags.length > 0">
//                       <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
//                       <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
//                     </div>
//                     <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
//                       <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
//                     </div>
//                     <span class="note-card-date">{{ note.createdAt | date:'shortTime' }}</span>
//                   </div>
//                 </div>
//                 <ng-template #noDailyNotes>
//                     <div class="empty-state"><i class="pi pi-inbox"></i><span>No notes for this day.</span></div>
//                 </ng-template>
//               </div>
//               <div *ngIf="isLoading.day" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
//             </div>
//             <div class="note-editor-panel">
//               <form [formGroup]="noteForm" (ngSubmit)="saveNote()">
//                 <div class="editor-header">
//                   <h2 class="section-title">{{ isEditing ? 'Edit Note' : 'Create Note' }}</h2>
//                   <div class="editor-actions">
//                     <button *ngIf="isEditing" pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-outlined p-button-sm" [disabled]="!isEditable(selectedNote)" (click)="deleteNote(selectedNote)"></button>
//                     <button pButton type="submit" label="Save" icon="pi pi-check" class="p-button-sm" [disabled]="noteForm.invalid || isSaving || (isEditing && !isEditable(selectedNote))"></button>
//                   </div>
//                 </div>
//                 <div class="editor-content">
//                     <div *ngIf="isEditing && !isEditable(selectedNote)" class="read-only-banner">
//                         <i class="pi pi-lock"></i> Notes from past days are read-only.
//                     </div>
//                     <div class="form-field"><input type="text" pInputText placeholder="Note Title" formControlName="title"></div>
//                     <div class="form-field"><textarea pInputTextarea placeholder="Start writing..." formControlName="content" rows="10"></textarea></div>
//                     <div class="form-field"><label>Tags</label><p-chips formControlName="tags" separator=","></p-chips></div>
//                     <div class="form-field"><label>Attachments</label><app-image-uploader (uploaded)="onImageUploaded($event)"></app-image-uploader></div>
//                     <div class="attachments-preview" *ngIf="noteForm.get('attachments')?.value.length > 0">
//                       <div *ngFor="let url of noteForm.get('attachments')?.value; let i = index" class="attachment-thumbnail">
//                         <img [src]="url" alt="Preview"><button type="button" class="remove-btn" (click)="removeAttachment(i)"><i class="pi pi-times"></i></button>
//                       </div>
//                     </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </p-tabPanel>

//         <p-tabPanel *ngFor="let summary of summaries; let i = index" [header]="summary.title">
//             <div class="notes-layout">
//               <div class="notes-sidebar">
//                 <div class="sidebar-header">
//                   <h2 class="section-title">{{ summary.title }} Summary</h2>
//                   <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
//                 </div>
//                 <div class="notes-list" *ngIf="!isLoading[summary.key]">
//                   <div *ngIf="summary.data.length > 0; else noSummaryNotes">
//                     <div *ngFor="let note of summary.data" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectForPreview(note)">
//                       <div class="note-card-header">
//                         <h3 class="note-card-title">{{ note.title }}</h3>
//                       </div>
//                       <p class="note-card-content">{{ note.content | slice:0:150 }}...</p>
//                       <div class="note-card-tags" *ngIf="note.tags.length > 0">
//                         <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
//                         <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
//                       </div>
//                       <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
//                         <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
//                       </div>
//                       <span class="note-card-date">{{ note.createdAt | date:'fullDate' }}</span>
//                     </div>
//                   </div>
//                   <ng-template #noSummaryNotes>
//                       <div class="empty-state"><i [class]="summary.icon"></i><span>No notes found for this {{ summary.key }}.</span></div>
//                   </ng-template>
//                 </div>
//                 <div *ngIf="isLoading[summary.key]" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
//               </div>
//               <div class="note-preview-panel">
//                 <div class="preview-header">
//                   <h2 class="section-title">Note Preview</h2>
//                 </div>
//                 <div class="preview-content" *ngIf="selectedNote; else noPreview">
//                   <h3 class="preview-title">{{ selectedNote.title }}</h3>
//                   <p class="preview-text">{{ selectedNote.content }}</p>
//                   <div class="note-card-tags" *ngIf="selectedNote.tags.length > 0">
//                     <label>Tags:</label>
//                     <span *ngFor="let tag of selectedNote.tags" class="note-tag">{{ tag }}</span>
//                   </div>
//                   <div class="attachments-preview" *ngIf="selectedNote.attachments.length > 0">
//                     <label>Attachments:</label>
//                     <div *ngFor="let url of selectedNote.attachments; let i = index" class="attachment-thumbnail">
//                       <img [src]="url" alt="Preview">
//                     </div>
//                   </div>
//                   <span class="note-card-date">{{ selectedNote.createdAt | date:'fullDate' }}</span>
//                 </div>
//                 <ng-template #noPreview>
//                   <div class="empty-state"><i class="pi pi-file"></i><span>Select a note to preview.</span></div>
//                 </ng-template>
//               </div>
//             </div>
//         </p-tabPanel>
//       </p-tabView>
//     </div>
//   `,
//   styles: [`
//     :host, .notes-container { display: block; height: 100%; width: 100%; min-height: 100%; }
//     /* Make TabView content take full height */
//     :host ::ng-deep .p-tabview .p-tabview-panels { height: calc(100% - 45px); }
//     :host ::ng-deep .p-tabview-panel { height: 100%; }
//     .notes-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--spacing-md); height: 100%; }
//     .notes-sidebar, .note-editor-panel, .note-preview-panel { background: var(--theme-bg-secondary); border-radius: var(--ui-border-radius); border: 1px solid var(--theme-border-primary); display: flex; flex-direction: column; overflow: hidden; }
//     .sidebar-header, .editor-header, .preview-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); flex-shrink: 0; }
//     .header-actions { display: flex; align-items: center; gap: var(--spacing-xs); }
//     .section-title { font-family: var(--font-primary); font-size: var(--font-size-lg); font-weight: 600; color: var(--theme-text-primary); margin: 0; }
//     .search-bar { padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); }
//     .notes-list, .summary-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); }
//     .loading-spinner, .empty-state { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; color: var(--theme-text-muted); padding: var(--spacing-xl); }
//     .empty-state .pi { font-size: 2rem; margin-bottom: var(--spacing-md); }
//     .note-card { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--ui-border-radius-sm); margin-bottom: var(--spacing-sm); cursor: pointer; transition: var(--ui-transition-fast); border: 1px solid transparent; background: var(--theme-bg-primary); position: relative; }
//     .note-card:hover { background-color: var(--theme-hover-bg); }
//     .note-card.active { background-color: var(--theme-accent-primary-light); border-color: var(--theme-accent-primary); }
//     .note-card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm); }
//     .note-card-title { font-weight: 600; font-size: var(--font-size-sm); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
//     .note-card-content { font-size: var(--font-size-xs); color: var(--theme-text-secondary); margin: var(--spacing-xs) 0; line-height: var(--line-height-tight); }
//     .note-card-tags { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin: var(--spacing-xs) 0; }
//     .note-tag { background: var(--theme-accent-primary-light); color: var(--theme-accent-primary); font-size: var(--font-size-xs); padding: 0.125rem 0.5rem; border-radius: var(--ui-border-radius-full); }
//     .note-card-attachments { margin: var(--spacing-xs) 0; }
//     .attachment-count { font-size: var(--font-size-xs); color: var(--theme-text-muted); display: inline-flex; align-items: center; gap: var(--spacing-xs); }
//     .note-card-date { font-size: var(--font-size-xs); color: var(--theme-text-label); font-weight: 500; }
//     .note-card-actions { display: none; }
//     .note-card:hover .note-card-actions { display: flex; }
//     .note-editor-panel form { display: flex; flex-direction: column; height: 100%; }
//     .editor-content, .preview-content { flex: 1; padding: var(--spacing-md); overflow-y: auto; }
//     .form-field { margin-bottom: var(--spacing-md); }
//     .form-field label { font-size: var(--font-size-xs); display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--theme-text-label); }
//     .attachments-preview { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
//     .attachment-thumbnail { position: relative; width: 60px; height: 60px; border-radius: var(--ui-border-radius-sm); overflow: hidden; }
//     .attachment-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
//     .remove-btn { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: var(--ui-transition-fast); }
//     .attachment-thumbnail:hover .remove-btn { opacity: 1; }
//     .read-only-banner { padding: var(--spacing-sm) var(--spacing-md); background: var(--theme-warning-light); color: var(--theme-text-secondary); font-size: var(--font-size-xs); border-radius: var(--ui-border-radius-sm); display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
//     .preview-title { font-size: var(--font-size-lg); margin-bottom: var(--spacing-md); }
//     .preview-text { white-space: pre-wrap; word-wrap: break-word; font-size: var(--font-size-base); line-height: var(--line-height-normal); color: var(--theme-text-primary); }
//   `]
// })
// export class NotesManagerComponent implements OnInit, OnChanges {
//   private noteService = inject(NoteService);
//   private fb = inject(FormBuilder);
//   private messageService = inject(MessageService);

//   @Input() date!: CalendarDay;
  
//   // State
//   dailyNotes: Note[] = [];
//   filteredDailyNotes: Note[] = [];
//   summaries: Summary[] = [];

//   selectedNote: Note | null = null;
//   noteForm: FormGroup;
//   isEditing = false;
//   isSaving = false;
//   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
//   activeTabIndex = 0;
  
//   private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

//   constructor() {
//     this.noteForm = this.fb.group({
//       _id: [null], title: ['', Validators.required], content: ['', Validators.required],
//       tags: [[]], attachments: [[]], createdAt: [null]
//     });
//   }

//   ngOnInit(): void {
//     this.summaries = [
//         { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
//         { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar-minus' },
//         { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
//     ];
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['date'] && changes['date'].currentValue) {
//       this.activeTabIndex = 0; // Always switch back to the Day tab on date change
//       this.resetAllNotes();
//       this.loadDailyNotes();
//     }
//   }

//   refreshCurrentView(): void {
//     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
//     if (tabKey === 'day') this.loadDailyNotes();
//     if (tabKey === 'week') this.loadWeeklyNotes();
//     if (tabKey === 'month') this.loadMonthlyNotes();
//     if (tabKey === 'year') this.loadYearlyNotes();
//   }

//   onTabChange(event: any): void {
//     this.activeTabIndex = event.index;
//     const tabKey = this.activeTabIndex > 0 ? this.summaries[this.activeTabIndex - 1].key as ('week'|'month'|'year') : 'day';
    
//     // Load data only if it hasn't been loaded before for that tab
//     if (tabKey !== 'day' && !this.loadedTabs[tabKey]) {
//         this.refreshCurrentView();
//     }
//     // Reset selected note when changing tabs
//     this.selectedNote = null;
//   }

//   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];
  
//   isEditable(note: Note | null): boolean {
//     if (!note || !note.createdAt) return false;
//     const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
//     const todayDate = new Date().setHours(0, 0, 0, 0);
//     return noteDate === todayDate;
//   }

//   private sortNotes(notes: Note[]): Note[] {
//     return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   }

//   // --- DATA LOADING ---
//   loadDailyNotes(): void {
//     if (!this.date?.date) return;
//     this.isLoading.day = true;
//     this.startNewNote();
//     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
//       .pipe(finalize(() => this.isLoading.day = false))
//       .subscribe(res => {
//         this.dailyNotes = this.sortNotes(res.data.notes || []);
//         this.filteredDailyNotes = this.dailyNotes;
//       });
//   }

//   loadWeeklyNotes(): void {
//     if (!this.date?.date) return;
//     this.isLoading.week = true;
//     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
//       .pipe(finalize(() => this.isLoading.week = false))
//       .subscribe(res => {
//         this.summaries[0].data = this.sortNotes(res.data.notes || []);
//         this.loadedTabs.week = true;
//       });
//   }

//   loadMonthlyNotes(): void {
//     if (!this.date?.date) return;
//     this.isLoading.month = true;
//     const d = this.date.date;
//     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
//       .pipe(finalize(() => this.isLoading.month = false))
//       .subscribe(res => {
//         this.summaries[1].data = this.sortNotes(res.data.notes || []);
//         this.loadedTabs.month = true;
//       });
//   }

//   loadYearlyNotes(): void {
//     if (!this.date?.date) return;
//     this.isLoading.year = true;
//     this.noteService.getNotes({ year: this.date.date.getFullYear() })
//       .pipe(finalize(() => this.isLoading.year = false))
//       .subscribe(res => {
//         this.summaries[2].data = this.sortNotes(res.data.notes || []);
//         this.loadedTabs.year = true;
//       });
//   }
  
//   filterNotes(event: Event): void {
//     const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
//     this.filteredDailyNotes = !searchTerm ? this.dailyNotes : this.dailyNotes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
//   }

//   selectNote(note: Note, event?: MouseEvent): void {
//     if (event) event.stopPropagation();
//     this.selectedNote = note;
//     this.isEditing = true;
//     this.noteForm.patchValue(note);

//     if (!this.isEditable(note)) {
//       this.noteForm.disable();
//     } else {
//       this.noteForm.enable();
//     }
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
//       tags: [], attachments: []
//     });
//   }

//   saveNote(): void {
//     if (this.noteForm.invalid) return;
//     this.isSaving = true;
    
//     const formData = this.noteForm.getRawValue(); // Use getRawValue to get data from disabled form
//     const operation = this.isEditing 
//       ? this.noteService.updateNote(formData._id, formData) 
//       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

//     operation.pipe(finalize(() => this.isSaving = false)).subscribe({
//       next: (res) => {
//         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
//         this.loadDailyNotes();
//         this.selectNote(res.data.note);
//       },
//       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
//     });
//   }

//   deleteNote(note: Note | null, event?: MouseEvent): void {
//     if (event) event.stopPropagation();
//     if (!note || !this.isEditable(note)) {
//         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
//         return;
//     }

//     // CONFIRMATION DIALOG IS HIGHLY RECOMMENDED HERE
//     this.noteService.deleteNote(note._id).subscribe({
//       next: () => {
//         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
//         this.loadDailyNotes();
//       },
//       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
//     });
//   }

//   onImageUploaded(url: string): void {
//     const attachments = this.noteForm.get('attachments')?.value || [];
//     this.noteForm.get('attachments')?.setValue([...attachments, url]);
//   }

//   removeAttachment(index: number): void {
//     const attachments = this.noteForm.get('attachments')?.value || [];
//     attachments.splice(index, 1);
//     this.noteForm.get('attachments')?.setValue(attachments);
//   }

//   private resetAllNotes(): void {
//     this.dailyNotes = [];
//     this.filteredDailyNotes = [];
//     this.summaries.forEach(s => s.data = []);
//     this.loadedTabs = { week: false, month: false, year: false };
//     this.startNewNote();
//   }
// }

// // import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // import { finalize } from 'rxjs/operators';

// // // --- Your App's Modules & Components ---
// // import { ImageUploaderComponent } from './image-uploader.component';
// // import { NoteService, NoteFilterParams } from '../../core/services/notes.service';

// // // --- PrimeNG Modules for UI ---
// // import { ButtonModule } from 'primeng/button';
// // import { InputTextModule } from 'primeng/inputtext';
// // import { TextareaModule } from 'primeng/textarea';
// // import { ChipsModule } from 'primeng/chips';
// // import { ToastModule } from 'primeng/toast';
// // import { MessageService } from 'primeng/api';
// // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // import { TabViewModule } from 'primeng/tabview';
// // import { TooltipModule } from 'primeng/tooltip';

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

// // interface Summary {
// //   title: string;
// //   key: LoadingKey;
// //   data: Note[];
// //   icon: string;
// // }

// // @Component({
// //   selector: 'app-notes-manager',
// //   standalone: true,
// //   imports: [
// //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// //   ],
// //   providers: [MessageService],
// //   template: `
// //     <p-toast></p-toast>
// //     <div class="notes-container">
// //       <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">
// //         <p-tabPanel header="Day" >
// //           <div class="notes-layout">
// //             <div class="notes-sidebar">
// //               <div class="sidebar-header">
// //                 <h2 class="section-title">Daily Notes</h2>
// //                 <div class="header-actions">
// //                   <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// //                   <button pButton icon="pi pi-plus" label="New" class="p-button-sm" (click)="startNewNote()"></button>
// //                 </div>
// //               </div>
// //               <div class="search-bar">
// //                  <span class="p-input-icon-left">
// //                     <i class="pi pi-search"></i>
// //                     <input type="text" pInputText placeholder="Search..." class="w-full p-inputtext-sm" (input)="filterNotes($event)">
// //                  </span>
// //               </div>
// //               <div class="notes-list" *ngIf="!isLoading.day">
// //                 <div *ngIf="filteredDailyNotes.length > 0; else noDailyNotes">
// //                   <div *ngFor="let note of filteredDailyNotes" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectNote(note)">
// //                     <div class="note-card-header">
// //                       <h3 class="note-card-title">{{ note.title }}</h3>
// //                       <div class="note-card-actions" *ngIf="isEditable(note)">
// //                         <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm" (click)="selectNote(note, $event)" pTooltip="Edit Note"></button>
// //                         <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm p-button-danger" (click)="deleteNote(note, $event)" pTooltip="Delete Note"></button>
// //                       </div>
// //                     </div>
// //                     <p class="note-card-content">{{ note.content | slice:0:120 }}...</p>
// //                     <div class="note-card-tags" *ngIf="note.tags.length > 0">
// //                       <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
// //                       <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
// //                     </div>
// //                     <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
// //                       <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
// //                     </div>
// //                     <span class="note-card-date">{{ note.createdAt | date:'shortTime' }}</span>
// //                   </div>
// //                 </div>
// //                 <ng-template #noDailyNotes>
// //                     <div class="empty-state"><i class="pi pi-inbox"></i><span>No notes for this day.</span></div>
// //                 </ng-template>
// //               </div>
// //               <div *ngIf="isLoading.day" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// //             </div>
// //             <div class="note-editor-panel">
// //               <form [formGroup]="noteForm" (ngSubmit)="saveNote()">
// //                 <div class="editor-header">
// //                   <h2 class="section-title">{{ isEditing ? 'Edit Note' : 'Create Note' }}</h2>
// //                   <div class="editor-actions">
// //                     <button *ngIf="isEditing" pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-outlined p-button-sm" [disabled]="!isEditable(selectedNote)" (click)="deleteNote(selectedNote)"></button>
// //                     <button pButton type="submit" label="Save" icon="pi pi-check" class="p-button-sm" [disabled]="noteForm.invalid || isSaving || (isEditing && !isEditable(selectedNote))"></button>
// //                   </div>
// //                 </div>
// //                 <div class="editor-content">
// //                     <div *ngIf="isEditing && !isEditable(selectedNote)" class="read-only-banner">
// //                         <i class="pi pi-lock"></i> Notes from past days are read-only.
// //                     </div>
// //                     <div class="form-field"><input type="text" pInputText placeholder="Note Title" formControlName="title"></div>
// //                     <div class="form-field"><textarea pInputTextarea placeholder="Start writing..." formControlName="content" rows="10"></textarea></div>
// //                     <div class="form-field"><label>Tags</label><p-chips formControlName="tags" separator=","></p-chips></div>
// //                     <div class="form-field"><label>Attachments</label><app-image-uploader (uploaded)="onImageUploaded($event)"></app-image-uploader></div>
// //                     <div class="attachments-preview" *ngIf="noteForm.get('attachments')?.value.length > 0">
// //                       <div *ngFor="let url of noteForm.get('attachments')?.value; let i = index" class="attachment-thumbnail">
// //                         <img [src]="url" alt="Preview"><button type="button" class="remove-btn" (click)="removeAttachment(i)"><i class="pi pi-times"></i></button>
// //                       </div>
// //                     </div>
// //                 </div>
// //               </form>
// //             </div>
// //           </div>
// //         </p-tabPanel>

// //         <p-tabPanel *ngFor="let summary of summaries" [header]="summary.title">
// //             <div class="summary-view">
// //                 <div class="sidebar-header">
// //                     <h2 class="section-title">{{ summary.title }} Summary</h2>
// //                     <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// //                 </div>
// //                 <div *ngIf="isLoading[summary.key]" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// //                 <div *ngIf="!isLoading[summary.key] && summary.data.length > 0" class="summary-list">
// //                     <div *ngFor="let note of summary.data" class="note-card">
// //                         <h3 class="note-card-title">{{ note.title }}</h3>
// //                         <p class="note-card-content">{{ note.content | slice:0:150 }}...</p>
// //                         <div class="note-card-tags" *ngIf="note.tags.length > 0">
// //                           <span *ngFor="let tag of note.tags | slice:0:3" class="note-tag">{{ tag }}</span>
// //                           <span *ngIf="note.tags.length > 3" class="note-tag">+{{ note.tags.length - 3 }}</span>
// //                         </div>
// //                         <div class="note-card-attachments" *ngIf="note.attachments.length > 0">
// //                           <span class="attachment-count"><i class="pi pi-paperclip"></i> {{ note.attachments.length }}</span>
// //                         </div>
// //                         <span class="note-card-date">{{ note.createdAt | date:'fullDate' }}</span>
// //                     </div>
// //                 </div>
// //                 <div *ngIf="!isLoading[summary.key] && summary.data.length === 0" class="empty-state">
// //                     <i [class]="summary.icon"></i><span>No notes found for this {{ summary.key }}.</span>
// //                 </div>
// //             </div>
// //         </p-tabPanel>
// //       </p-tabView>
// //     </div>
// //   `,
// //   styles: [`
// //     :host, .notes-container { display: block; height: 100%; width: 100%; }
// //     /* Make TabView content take full height */
// //     :host ::ng-deep .p-tabview .p-tabview-panels { height: calc(100% - 45px); }
// //     :host ::ng-deep .p-tabview-panel { height: 100%; }
// //     .notes-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--spacing-md); height: 100%; }
// //     .notes-sidebar, .note-editor-panel { background: var(--theme-bg-secondary); border-radius: var(--ui-border-radius); border: 1px solid var(--theme-border-primary); display: flex; flex-direction: column; overflow: hidden; }
// //     .sidebar-header, .editor-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); flex-shrink: 0; }
// //     .header-actions { display: flex; align-items: center; gap: var(--spacing-xs); }
// //     .section-title { font-family: var(--font-primary); font-size: var(--font-size-lg); font-weight: 600; color: var(--theme-text-primary); margin: 0; }
// //     .search-bar { padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); }
// //     .notes-list, .summary-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); }
// //     .loading-spinner, .empty-state { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; color: var(--theme-text-muted); padding: var(--spacing-xl); }
// //     .empty-state .pi { font-size: 2rem; margin-bottom: var(--spacing-md); }
// //     .note-card { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--ui-border-radius-sm); margin-bottom: var(--spacing-sm); cursor: pointer; transition: var(--ui-transition-fast); border: 1px solid transparent; background: var(--theme-bg-primary); position: relative; }
// //     .note-card:hover { background-color: var(--theme-hover-bg); }
// //     .note-card.active { background-color: var(--theme-accent-primary-light); border-color: var(--theme-accent-primary); }
// //     .note-card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm); }
// //     .note-card-title { font-weight: 600; font-size: var(--font-size-sm); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
// //     .note-card-content { font-size: var(--font-size-xs); color: var(--theme-text-secondary); margin: var(--spacing-xs) 0; line-height: var(--line-height-tight); }
// //     .note-card-tags { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin: var(--spacing-xs) 0; }
// //     .note-tag { background: var(--theme-accent-primary-light); color: var(--theme-accent-primary); font-size: var(--font-size-xs); padding: 0.125rem 0.5rem; border-radius: var(--ui-border-radius-full); }
// //     .note-card-attachments { margin: var(--spacing-xs) 0; }
// //     .attachment-count { font-size: var(--font-size-xs); color: var(--theme-text-muted); display: inline-flex; align-items: center; gap: var(--spacing-xs); }
// //     .note-card-date { font-size: var(--font-size-xs); color: var(--theme-text-label); font-weight: 500; }
// //     .note-card-actions { display: none; }
// //     .note-card:hover .note-card-actions { display: flex; }
// //     .note-editor-panel form, .summary-view { display: flex; flex-direction: column; height: 100%; }
// //     .editor-content { flex: 1; padding: var(--spacing-md); overflow-y: auto; }
// //     .form-field { margin-bottom: var(--spacing-md); }
// //     .form-field label { font-size: var(--font-size-xs); display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--theme-text-label); }
// //     .attachments-preview { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
// //     .attachment-thumbnail { position: relative; width: 60px; height: 60px; border-radius: var(--ui-border-radius-sm); overflow: hidden; }
// //     .attachment-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
// //     .remove-btn { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: var(--ui-transition-fast); }
// //     .attachment-thumbnail:hover .remove-btn { opacity: 1; }
// //     .read-only-banner { padding: var(--spacing-sm) var(--spacing-md); background: var(--theme-warning-light); color: var(--theme-text-secondary); font-size: var(--font-size-xs); border-radius: var(--ui-border-radius-sm); display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
// //   `]
// // })
// // export class NotesManagerComponent implements OnInit, OnChanges {
// //   private noteService = inject(NoteService);
// //   private fb = inject(FormBuilder);
// //   private messageService = inject(MessageService);

// //   @Input() date!: CalendarDay;
  
// //   // State
// //   dailyNotes: Note[] = [];
// //   filteredDailyNotes: Note[] = [];
// //   summaries: Summary[] = [];

// //   selectedNote: Note | null = null;
// //   noteForm: FormGroup;
// //   isEditing = false;
// //   isSaving = false;
// //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// //   activeTabIndex = 0;
  
// //   private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

// //   constructor() {
// //     this.noteForm = this.fb.group({
// //       _id: [null], title: ['', Validators.required], content: ['', Validators.required],
// //       tags: [[]], attachments: [[]], createdAt: [null]
// //     });
// //   }

// //   ngOnInit(): void {
// //     this.summaries = [
// //         { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// //         { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar-minus' },
// //         { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// //     ];
// //   }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['date'] && changes['date'].currentValue) {
// //       this.activeTabIndex = 0; // Always switch back to the Day tab on date change
// //       this.resetAllNotes();
// //       this.loadDailyNotes();
// //     }
// //   }

// //   refreshCurrentView(): void {
// //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// //     if (tabKey === 'day') this.loadDailyNotes();
// //     if (tabKey === 'week') this.loadWeeklyNotes();
// //     if (tabKey === 'month') this.loadMonthlyNotes();
// //     if (tabKey === 'year') this.loadYearlyNotes();
// //   }

// //   onTabChange(event: any): void {
// //     this.activeTabIndex = event.index;
// //     const tabKey = this.activeTabIndex > 0 ? this.summaries[this.activeTabIndex - 1].key as ('week'|'month'|'year') : 'day';
    
// //     // Load data only if it hasn't been loaded before for that tab
// //     if (tabKey !== 'day' && !this.loadedTabs[tabKey]) {
// //         this.refreshCurrentView();
// //     }
// //   }

// //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];
  
// //   isEditable(note: Note | null): boolean {
// //     if (!note || !note.createdAt) return false;
// //     const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
// //     const todayDate = new Date().setHours(0, 0, 0, 0);
// //     return noteDate === todayDate;
// //   }

// //   // --- DATA LOADING ---
// //   loadDailyNotes(): void {
// //     if (!this.date?.date) return;
// //     this.isLoading.day = true;
// //     this.startNewNote();
// //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// //       .pipe(finalize(() => this.isLoading.day = false))
// //       .subscribe(res => {
// //         this.dailyNotes = res.data.notes || [];
// //         this.filteredDailyNotes = this.dailyNotes;
// //       });
// //   }

// //   loadWeeklyNotes(): void {
// //     if (!this.date?.date) return;
// //     this.isLoading.week = true;
// //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// //       .pipe(finalize(() => this.isLoading.week = false))
// //       .subscribe(res => {
// //         this.summaries[0].data = res.data.notes || [];
// //         this.loadedTabs.week = true;
// //       });
// //   }

// //   loadMonthlyNotes(): void {
// //     if (!this.date?.date) return;
// //     this.isLoading.month = true;
// //     const d = this.date.date;
// //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// //       .pipe(finalize(() => this.isLoading.month = false))
// //       .subscribe(res => {
// //         this.summaries[1].data = res.data.notes || [];
// //         this.loadedTabs.month = true;
// //       });
// //   }

// //   loadYearlyNotes(): void {
// //     if (!this.date?.date) return;
// //     this.isLoading.year = true;
// //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// //       .pipe(finalize(() => this.isLoading.year = false))
// //       .subscribe(res => {
// //         this.summaries[2].data = res.data.notes || [];
// //         this.loadedTabs.year = true;
// //       });
// //   }
  
// //   filterNotes(event: Event): void {
// //     const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
// //     this.filteredDailyNotes = !searchTerm ? this.dailyNotes : this.dailyNotes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
// //   }

// //   selectNote(note: Note, event?: MouseEvent): void {
// //     if (event) event.stopPropagation();
// //     this.selectedNote = note;
// //     this.isEditing = true;
// //     this.noteForm.patchValue(note);

// //     if (!this.isEditable(note)) {
// //       this.noteForm.disable();
// //     } else {
// //       this.noteForm.enable();
// //     }
// //   }

// //   startNewNote(): void {
// //     this.selectedNote = null;
// //     this.isEditing = false;
// //     this.noteForm.enable();
// //     this.noteForm.reset({
// //       createdAt: this.date ? this.date.date : new Date(),
// //       tags: [], attachments: []
// //     });
// //   }

// //   saveNote(): void {
// //     if (this.noteForm.invalid) return;
// //     this.isSaving = true;
    
// //     const formData = this.noteForm.getRawValue(); // Use getRawValue to get data from disabled form
// //     const operation = this.isEditing 
// //       ? this.noteService.updateNote(formData._id, formData) 
// //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// //     operation.pipe(finalize(() => this.isSaving = false)).subscribe({
// //       next: (res) => {
// //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// //         this.loadDailyNotes();
// //         this.selectNote(res.data.note);
// //       },
// //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// //     });
// //   }

// //   deleteNote(note: Note | null, event?: MouseEvent): void {
// //     if (event) event.stopPropagation();
// //     if (!note || !this.isEditable(note)) {
// //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
// //         return;
// //     }

// //     // CONFIRMATION DIALOG IS HIGHLY RECOMMENDED HERE
// //     this.noteService.deleteNote(note._id).subscribe({
// //       next: () => {
// //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// //         this.loadDailyNotes();
// //       },
// //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// //     });
// //   }

// //   onImageUploaded(url: string): void {
// //     const attachments = this.noteForm.get('attachments')?.value || [];
// //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// //   }

// //   removeAttachment(index: number): void {
// //     const attachments = this.noteForm.get('attachments')?.value || [];
// //     attachments.splice(index, 1);
// //     this.noteForm.get('attachments')?.setValue(attachments);
// //   }

// //   private resetAllNotes(): void {
// //     this.dailyNotes = [];
// //     this.filteredDailyNotes = [];
// //     this.summaries.forEach(s => s.data = []);
// //     this.loadedTabs = { week: false, month: false, year: false };
// //     this.startNewNote();
// //   }
// // }

// // // import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// // // import { finalize } from 'rxjs/operators';

// // // // --- Your App's Modules & Components ---
// // // import { ImageUploaderComponent } from './image-uploader.component';
// // // import { NoteService, NoteFilterParams } from '../../core/services/notes.service';

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

// // // interface Summary {
// // //   title: string;
// // //   key: LoadingKey;
// // //   data: Note[];
// // //   icon: string;
// // // }

// // // @Component({
// // //   selector: 'app-notes-manager',
// // //   standalone: true,
// // //   imports: [
// // //     CommonModule, ReactiveFormsModule, ImageUploaderComponent,
// // //     ButtonModule, InputTextModule, TextareaModule, ChipsModule,
// // //     ToastModule, ProgressSpinnerModule, TabViewModule, TooltipModule
// // //   ],
// // //   providers: [MessageService],
// // //   template: `
// // //     <p-toast></p-toast>
// // //     <div class="notes-container">
// // //       <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">
// // //         <p-tabPanel header="Day" >
// // //           <div class="notes-layout">
// // //             <div class="notes-sidebar">
// // //               <div class="sidebar-header">
// // //                 <h2 class="section-title">Daily Notes</h2>
// // //                 <div class="header-actions">
// // //                   <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// // //                   <button pButton icon="pi pi-plus" label="New" class="p-button-sm" (click)="startNewNote()"></button>
// // //                 </div>
// // //               </div>
// // //               <div class="search-bar">
// // //                  <span class="p-input-icon-left">
// // //                     <i class="pi pi-search"></i>
// // //                     <input type="text" pInputText placeholder="Search..." class="w-full p-inputtext-sm" (input)="filterNotes($event)">
// // //                  </span>
// // //               </div>
// // //               <div class="notes-list" *ngIf="!isLoading.day">
// // //                 <div *ngIf="filteredDailyNotes.length > 0; else noDailyNotes">
// // //                   <div *ngFor="let note of filteredDailyNotes" class="note-card" [class.active]="selectedNote?._id === note._id" (click)="selectNote(note)">
// // //                     <div class="note-card-header">
// // //                       <h3 class="note-card-title">{{ note.title }}</h3>
// // //                       <div class="note-card-actions" *ngIf="isEditable(note)">
// // //                         <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm" (click)="selectNote(note, $event)" pTooltip="Edit Note"></button>
// // //                         <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm p-button-danger" (click)="deleteNote(note, $event)" pTooltip="Delete Note"></button>
// // //                       </div>
// // //                     </div>
// // //                     <p class="note-card-content">{{ note.content | slice:0:80 }}...</p>
// // //                     <span class="note-card-date">{{ note.createdAt | date:'shortTime' }}</span>
// // //                   </div>
// // //                 </div>
// // //                 <ng-template #noDailyNotes>
// // //                     <div class="empty-state"><i class="pi pi-inbox"></i><span>No notes for this day.</span></div>
// // //                 </ng-template>
// // //               </div>
// // //               <div *ngIf="isLoading.day" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// // //             </div>
// // //             <div class="note-editor-panel">
// // //               <form [formGroup]="noteForm" (ngSubmit)="saveNote()">
// // //                 <div class="editor-header">
// // //                   <h2 class="section-title">{{ isEditing ? 'Edit Note' : 'Create Note' }}</h2>
// // //                   <div class="editor-actions">
// // //                     <button *ngIf="isEditing" pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-outlined p-button-sm" [disabled]="!isEditable(selectedNote)" (click)="deleteNote(selectedNote)"></button>
// // //                     <button pButton type="submit" label="Save" icon="pi pi-check" class="p-button-sm" [disabled]="noteForm.invalid || isSaving || (isEditing && !isEditable(selectedNote))"></button>
// // //                   </div>
// // //                 </div>
// // //                 <div class="editor-content">
// // //                     <div *ngIf="isEditing && !isEditable(selectedNote)" class="read-only-banner">
// // //                         <i class="pi pi-lock"></i> Notes from past days are read-only.
// // //                     </div>
// // //                     <div class="form-field"><input type="text" pInputText placeholder="Note Title" formControlName="title"></div>
// // //                     <div class="form-field"><textarea pInputTextarea placeholder="Start writing..." formControlName="content" rows="8"></textarea></div>
// // //                     <div class="form-field"><label>Tags</label><p-chips formControlName="tags" separator=","></p-chips></div>
// // //                     <div class="form-field"><label>Attachments</label><app-image-uploader (uploaded)="onImageUploaded($event)"></app-image-uploader></div>
// // //                     <div class="attachments-preview" *ngIf="noteForm.get('attachments')?.value.length > 0">
// // //                       <div *ngFor="let url of noteForm.get('attachments')?.value; let i = index" class="attachment-thumbnail">
// // //                         <img [src]="url" alt="Preview"><button type="button" class="remove-btn" (click)="removeAttachment(i)"><i class="pi pi-times"></i></button>
// // //                       </div>
// // //                     </div>
// // //                 </div>
// // //               </form>
// // //             </div>
// // //           </div>
// // //         </p-tabPanel>

// // //         <p-tabPanel *ngFor="let summary of summaries" [header]="summary.title">
// // //             <div class="summary-view">
// // //                 <div class="sidebar-header">
// // //                     <h2 class="section-title">{{ summary.title }} Summary</h2>
// // //                     <button pButton type="button" icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="refreshCurrentView()" pTooltip="Refresh List"></button>
// // //                 </div>
// // //                 <div *ngIf="isLoading[summary.key]" class="loading-spinner"><p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner></div>
// // //                 <div *ngIf="!isLoading[summary.key] && summary.data.length > 0" class="summary-list">
// // //                     <div *ngFor="let note of summary.data" class="note-card">
// // //                         <h3 class="note-card-title">{{ note.title }}</h3>
// // //                         <p class="note-card-content">{{ note.content | slice:0:100 }}...</p>
// // //                         <span class="note-card-date">{{ note.createdAt | date:'fullDate' }}</span>
// // //                     </div>
// // //                 </div>
// // //                 <div *ngIf="!isLoading[summary.key] && summary.data.length === 0" class="empty-state">
// // //                     <i [class]="summary.icon"></i><span>No notes found for this {{ summary.key }}.</span>
// // //                 </div>
// // //             </div>
// // //         </p-tabPanel>
// // //       </p-tabView>
// // //     </div>
// // //   `,
// // //   styles: [`
// // //     :host, .notes-container { display: block; height: 100%; width: 100%; }
// // //     /* Make TabView content take full height */
// // //     :host ::ng-deep .p-tabview .p-tabview-panels { height: calc(100% - 45px); }
// // //     :host ::ng-deep .p-tabview-panel { height: 100%; }
// // //     .notes-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--spacing-md); height: 100%; }
// // //     .notes-sidebar, .note-editor-panel { background: var(--theme-bg-secondary); border-radius: var(--ui-border-radius); border: 1px solid var(--theme-border-primary); display: flex; flex-direction: column; overflow: hidden; }
// // //     .sidebar-header, .editor-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); flex-shrink: 0; }
// // //     .header-actions { display: flex; align-items: center; gap: var(--spacing-xs); }
// // //     .section-title { font-family: var(--font-primary); font-size: var(--font-size-lg); font-weight: 600; color: var(--theme-text-primary); margin: 0; }
// // //     .search-bar { padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--theme-border-primary); }
// // //     .notes-list, .summary-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); }
// // //     .loading-spinner, .empty-state { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; color: var(--theme-text-muted); padding: var(--spacing-xl); }
// // //     .empty-state .pi { font-size: 2rem; margin-bottom: var(--spacing-md); }
// // //     .note-card { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--ui-border-radius-sm); margin-bottom: var(--spacing-sm); cursor: pointer; transition: var(--ui-transition-fast); border: 1px solid transparent; background: var(--theme-bg-primary); position: relative; }
// // //     .note-card:hover { background-color: var(--theme-hover-bg); }
// // //     .note-card.active { background-color: var(--theme-accent-primary-light); border-color: var(--theme-accent-primary); }
// // //     .note-card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm); }
// // //     .note-card-title { font-weight: 600; font-size: var(--font-size-sm); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
// // //     .note-card-content { font-size: var(--font-size-xs); color: var(--theme-text-secondary); margin: var(--spacing-xs) 0; }
// // //     .note-card-date { font-size: 0.7rem; color: var(--theme-text-label); font-weight: 500; }
// // //     .note-card-actions { display: none; }
// // //     .note-card:hover .note-card-actions { display: flex; }
// // //     .note-editor-panel form, .summary-view { display: flex; flex-direction: column; height: 100%; }
// // //     .editor-content { flex: 1; padding: var(--spacing-md); overflow-y: auto; }
// // //     .form-field { margin-bottom: var(--spacing-md); }
// // //     .form-field label { font-size: var(--font-size-xs); display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--theme-text-label); }
// // //     .attachments-preview { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
// // //     .attachment-thumbnail { position: relative; width: 60px; height: 60px; border-radius: var(--ui-border-radius-sm); overflow: hidden; }
// // //     .attachment-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
// // //     .remove-btn { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: var(--ui-transition-fast); }
// // //     .attachment-thumbnail:hover .remove-btn { opacity: 1; }
// // //     .read-only-banner { padding: var(--spacing-sm) var(--spacing-md); background: var(--theme-warning-light); color: var(--theme-text-secondary); font-size: var(--font-size-xs); border-radius: var(--ui-border-radius-sm); display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
// // //   `]
// // // })
// // // export class NotesManagerComponent implements OnInit, OnChanges {
// // //   private noteService = inject(NoteService);
// // //   private fb = inject(FormBuilder);
// // //   private messageService = inject(MessageService);

// // //   @Input() date!: CalendarDay;
  
// // //   // State
// // //   dailyNotes: Note[] = [];
// // //   filteredDailyNotes: Note[] = [];
// // //   summaries: Summary[] = [];

// // //   selectedNote: Note | null = null;
// // //   noteForm: FormGroup;
// // //   isEditing = false;
// // //   isSaving = false;
// // //   isLoading: { [key in LoadingKey]: boolean } = { day: true, week: false, month: false, year: false };
// // //   activeTabIndex = 0;
  
// // //   private loadedTabs: { [key in 'week' | 'month' | 'year']: boolean } = { week: false, month: false, year: false };

// // //   constructor() {
// // //     this.noteForm = this.fb.group({
// // //       _id: [null], title: ['', Validators.required], content: ['', Validators.required],
// // //       tags: [[]], attachments: [[]], createdAt: [null]
// // //     });
// // //   }

// // //   ngOnInit(): void {
// // //     this.summaries = [
// // //         { title: 'Week', key: 'week', data: [], icon: 'pi pi-calendar-times' },
// // //         { title: 'Month', key: 'month', data: [], icon: 'pi pi-calendar-minus' },
// // //         { title: 'Year', key: 'year', data: [], icon: 'pi pi-server' }
// // //     ];
// // //   }

// // //   ngOnChanges(changes: SimpleChanges): void {
// // //     if (changes['date'] && changes['date'].currentValue) {
// // //       this.activeTabIndex = 0; // Always switch back to the Day tab on date change
// // //       this.resetAllNotes();
// // //       this.loadDailyNotes();
// // //     }
// // //   }

// // //   refreshCurrentView(): void {
// // //     const tabKey = this.activeTabIndex === 0 ? 'day' : this.summaries[this.activeTabIndex - 1].key;
// // //     if (tabKey === 'day') this.loadDailyNotes();
// // //     if (tabKey === 'week') this.loadWeeklyNotes();
// // //     if (tabKey === 'month') this.loadMonthlyNotes();
// // //     if (tabKey === 'year') this.loadYearlyNotes();
// // //   }

// // //   onTabChange(event: any): void {
// // //     this.activeTabIndex = event.index;
// // //     const tabKey = this.activeTabIndex > 0 ? this.summaries[this.activeTabIndex - 1].key as ('week'|'month'|'year') : 'day';
    
// // //     // Load data only if it hasn't been loaded before for that tab
// // //     if (tabKey !== 'day' && !this.loadedTabs[tabKey]) {
// // //         this.refreshCurrentView();
// // //     }
// // //   }

// // //   private formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];
  
// // //   isEditable(note: Note | null): boolean {
// // //     if (!note || !note.createdAt) return false;
// // //     const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
// // //     const todayDate = new Date().setHours(0, 0, 0, 0);
// // //     return noteDate === todayDate;
// // //   }

// // //   // --- DATA LOADING ---
// // //   loadDailyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.isLoading.day = true;
// // //     this.startNewNote();
// // //     this.noteService.getNotes({ date: this.formatDateForApi(this.date.date) })
// // //       .pipe(finalize(() => this.isLoading.day = false))
// // //       .subscribe(res => {
// // //         this.dailyNotes = res.data.notes || [];
// // //         this.filteredDailyNotes = this.dailyNotes;
// // //       });
// // //   }

// // //   loadWeeklyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.isLoading.week = true;
// // //     this.noteService.getNotes({ week: this.formatDateForApi(this.date.date) })
// // //       .pipe(finalize(() => this.isLoading.week = false))
// // //       .subscribe(res => {
// // //         this.summaries[0].data = res.data.notes || [];
// // //         this.loadedTabs.week = true;
// // //       });
// // //   }

// // //   loadMonthlyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.isLoading.month = true;
// // //     const d = this.date.date;
// // //     this.noteService.getNotes({ month: d.getMonth() + 1, year: d.getFullYear() })
// // //       .pipe(finalize(() => this.isLoading.month = false))
// // //       .subscribe(res => {
// // //         this.summaries[1].data = res.data.notes || [];
// // //         this.loadedTabs.month = true;
// // //       });
// // //   }

// // //   loadYearlyNotes(): void {
// // //     if (!this.date?.date) return;
// // //     this.isLoading.year = true;
// // //     this.noteService.getNotes({ year: this.date.date.getFullYear() })
// // //       .pipe(finalize(() => this.isLoading.year = false))
// // //       .subscribe(res => {
// // //         this.summaries[2].data = res.data.notes || [];
// // //         this.loadedTabs.year = true;
// // //       });
// // //   }
  
// // //   filterNotes(event: Event): void {
// // //     const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
// // //     this.filteredDailyNotes = !searchTerm ? this.dailyNotes : this.dailyNotes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
// // //   }

// // //   selectNote(note: Note, event?: MouseEvent): void {
// // //     if (event) event.stopPropagation();
// // //     this.selectedNote = note;
// // //     this.isEditing = true;
// // //     this.noteForm.patchValue(note);

// // //     if (!this.isEditable(note)) {
// // //       this.noteForm.disable();
// // //     } else {
// // //       this.noteForm.enable();
// // //     }
// // //   }

// // //   startNewNote(): void {
// // //     this.selectedNote = null;
// // //     this.isEditing = false;
// // //     this.noteForm.enable();
// // //     this.noteForm.reset({
// // //       createdAt: this.date ? this.date.date : new Date(),
// // //       tags: [], attachments: []
// // //     });
// // //   }

// // //   saveNote(): void {
// // //     if (this.noteForm.invalid) return;
// // //     this.isSaving = true;
    
// // //     const formData = this.noteForm.getRawValue(); // Use getRawValue to get data from disabled form
// // //     const operation = this.isEditing 
// // //       ? this.noteService.updateNote(formData._id, formData) 
// // //       : this.noteService.createNote({ ...formData, createdAt: this.date.date });

// // //     operation.pipe(finalize(() => this.isSaving = false)).subscribe({
// // //       next: (res) => {
// // //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Note saved!' });
// // //         this.loadDailyNotes();
// // //         this.selectNote(res.data.note);
// // //       },
// // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note.' })
// // //     });
// // //   }

// // //   deleteNote(note: Note | null, event?: MouseEvent): void {
// // //     if (event) event.stopPropagation();
// // //     if (!note || !this.isEditable(note)) {
// // //         this.messageService.add({ severity: 'warn', summary: 'Permission Denied', detail: 'Past notes cannot be deleted.' });
// // //         return;
// // //     }

// // //     // CONFIRMATION DIALOG IS HIGHLY RECOMMENDED HERE
// // //     this.noteService.deleteNote(note._id).subscribe({
// // //       next: () => {
// // //         this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Note has been deleted.' });
// // //         this.loadDailyNotes();
// // //       },
// // //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.' })
// // //     });
// // //   }

// // //   onImageUploaded(url: string): void {
// // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // //     this.noteForm.get('attachments')?.setValue([...attachments, url]);
// // //   }

// // //   removeAttachment(index: number): void {
// // //     const attachments = this.noteForm.get('attachments')?.value || [];
// // //     attachments.splice(index, 1);
// // //     this.noteForm.get('attachments')?.setValue(attachments);
// // //   }

// // //   private resetAllNotes(): void {
// // //     this.dailyNotes = [];
// // //     this.filteredDailyNotes = [];
// // //     this.summaries.forEach(s => s.data = []);
// // //     this.loadedTabs = { week: false, month: false, year: false };
// // //     this.startNewNote();
// // //   }
// // // }
