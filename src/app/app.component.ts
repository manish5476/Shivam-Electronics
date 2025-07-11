
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { LoadingComponent } from "./shared/Common/loader/loader.component";
import { LoadingService } from './core/services/loading.service';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ButtonModule, ToastModule,
    LoadingComponent,
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit,OnDestroy{
  title = 'shivam_Electronics';
  loadingSubscription: any;
  isLoading: any;

  constructor( @Inject(PLATFORM_ID) private platformId: Object ,private loadingService:LoadingService) { }
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }
}
