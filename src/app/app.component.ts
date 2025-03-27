// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'shivamElectronics';
// }
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ApiService } from './core/services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { AppMessageService } from './core/services/message.service';
import { ToastModule } from 'primeng/toast';
import { LoadingComponent } from "./shared/Common/loader/loader.component";
import { LoadingService } from './core/services/loading.service';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ButtonModule, ToastModule,
    LoadingComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit,OnDestroy{
  title = 'shivam_Electronics';
  loadingSubscription: any;
  isLoading: any;

  constructor(private ApiServide: ApiService, @Inject(PLATFORM_ID) private platformId: Object ,private loadingService:LoadingService) { }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ApiServide.getAutopopulateData().subscribe((res) => {
        sessionStorage.setItem('autopopulate', JSON.stringify(res.data));
      })
    }
    this.loadingSubscription = this.loadingService.isLoading$.subscribe(
      (loading) => {
        this.isLoading = loading;
      }
    );

  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }
}
