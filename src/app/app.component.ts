
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AutopopulateService } from './core/services/autopopulate.service';
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

  constructor(private AutopopulateService: AutopopulateService, @Inject(PLATFORM_ID) private platformId: Object ,private loadingService:LoadingService) { }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.AutopopulateService.getAllModulesData().subscribe((res:any) => {
        sessionStorage.setItem('autopopulate', JSON.stringify(res['data']));
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
