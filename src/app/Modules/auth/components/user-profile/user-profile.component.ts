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

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    TagModule,
    AvatarModule,
    FileUploadModule,
    ChipModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  // Initialize observables with a default empty state
  user$: Observable<any> = of({});
  groupedPermissions$: Observable<any[]> = of([]);
  isUploading$: Observable<boolean> = new BehaviorSubject<boolean>(false);

  roleSeverityMap: any = {
    'user': 'success',
    'admin': 'danger',
    'guest': 'info'
  };

  constructor(private profile: profileService) { }

  ngOnInit(): void {
    this.user$ = this.profile.getUserProfile().pipe(
      map(res => res.data.user)
    );

    // This assignment to groupedPermissions$ is correct and will
    // overwrite the initial `of([])` value once data is received.
    this.groupedPermissions$ = this.user$.pipe(
      map(user => this.groupPermissions(user.allowedRoutes))
    );
  }

  private groupPermissions(permissions: string[]): any[] {
    const groups: Record<string, { module: string; actions: string[] }> = {};
    permissions.forEach(permission => {
      const [module, action] = permission.split(':');
      if (!groups[module]) {
        groups[module] = { module: module, actions: [] };
      }
      groups[module].actions.push(action);
    });
    return Object.values(groups);
  }

  handleProfilePhotoUpload(event: any, uploader: any) {
    console.log('File upload triggered', event);
  }
}
// import { Component, OnInit } from '@angular/core';
// import { profileService } from '../../../../core/services/profile.service';
// import { Observable, BehaviorSubject, map } from 'rxjs';
// import { CommonModule } from '@angular/common'; // Import CommonModule
// import { TagModule } from "primeng/tag"; // Use TagModule instead of Tag
// import { AvatarModule } from 'primeng/avatar'; // Import AvatarModule
// import { FileUploadModule } from 'primeng/fileupload'; // Import FileUploadModule
// import { AccordionModule } from 'primeng/accordion'; // Import AccordionModule
// import { ChipModule } from 'primeng/chip';
// import { Toast } from "primeng/toast"; // Import ChipModule

// @Component({
//   selector: 'app-user-profile',
//   // You need to import all the PrimeNG modules and CommonModule
//   imports: [
//     CommonModule,
//     TagModule,
//     AvatarModule,
//     FileUploadModule,
//     AccordionModule,
//     ChipModule,
//     Toast
// ],
//   templateUrl: './user-profile.component.html',
//   styleUrl: './user-profile.component.css'
// })
// export class UserProfileComponent implements OnInit {
//   // Make user$ an Observable that holds the user data
//   user$: Observable<any> | undefined;
//   groupedPermissions$: Observable<any[]> | undefined;
//   isUploading$: Observable<boolean> = new BehaviorSubject<boolean>(false);

//   roleSeverityMap: any = {
//     'user': 'success',
//     'admin': 'danger',
//     'guest': 'info'
//   };

//   constructor(private profile: profileService) { }

//   ngOnInit(): void {
//     // Pipe the response to extract the user data and group permissions
//     this.user$ = this.profile.getUserProfile().pipe(
//       map(res => res.data.user) // Get the user object from the response
//     );

//     this.groupedPermissions$ = this.user$.pipe(
//       map(user => this.groupPermissions(user.allowedRoutes))
//     );
//   }

//   // Method to group permissions by module
//   private groupPermissions(permissions: string[]): any[] {
//     // Use a Record type to allow string keys and specify the value type
//     const groups: Record<string, { module: string; actions: string[] }> = {};

//     permissions.forEach(permission => {
//       const [module, action] = permission.split(':');
//       if (!groups[module]) {
//         groups[module] = { module: module, actions: [] };
//       }
//       groups[module].actions.push(action);
//     });

//     return Object.values(groups);
//   }

//   // The upload handler is needed to allow the file upload component to work
//   handleProfilePhotoUpload(event: any, uploader: any) {
//     // Logic for handling file upload
//   }
// }