import { Component, OnInit } from '@angular/core';
import { profileService } from '../../../../core/services/profile.service';
import { Observable, BehaviorSubject, map, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TagModule } from "primeng/tag";
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinner } from "primeng/progressspinner";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    AvatarModule,
    FileUploadModule,
    ChipModule,
    ButtonModule,
    ToastModule,
    ProgressSpinner
],
  providers: [MessageService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  user$: Observable<any> = of({});
  groupedPermissions$: Observable<any[]> = of([]);
  isUploading$ = new BehaviorSubject<boolean>(false);

  roleSeverityMap: any = {
    'user': 'success',
    'admin': 'danger',
    'guest': 'info'
  };

  constructor(
    private profile: profileService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    this.user$ = this.profile.getUserProfile().pipe(
      map(res => res.data.user)
    );
    this.groupedPermissions$ = this.user$.pipe(
      map(user => this.groupPermissions(user.allowedRoutes))
    );
  }

  private groupPermissions(permissions: string[]): any[] {
    const groups: Record<string, { module: string; actions: string[] }> = {};
    permissions?.forEach(permission => {
      const [module, action] = permission.split(':');
      if (!groups[module]) {
        groups[module] = { module: module, actions: [] };
      }
      groups[module].actions.push(action);
    });
    return Object.values(groups);
  }

  
  // Called when file is selected
  handleProfilePhotoUpload(event: any, uploader: any) {
    const file = event.files[0];
    if (!file) return;

    this.isUploading$.next(true);

    this.profile.uploadProfilePhoto(file).subscribe({
      next: (res) => {
        this.isUploading$.next(false);
        if (res.status === 'success') {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile image updated!' });
          this.loadUser(); // reload updated user profile
          uploader.clear(); // clear file upload input
        }
      },
      error: () => {
        this.isUploading$.next(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload profile image.' });
      },
    });
  }
}
