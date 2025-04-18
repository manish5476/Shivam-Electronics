import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  template: `
    <div class="min-h-screen flex flex-col">
    <app-header class="fixed top-0 h-64px left-0 w-full bg-white z-20 shadow-md"></app-header>

      <!-- <div class="flex flex-1 pt-[60px] overflow-hidden">
      <main class="w-full px-1 py-2 flex-grow overflow-y-scroll hide-scrollbar bg-gradient-to-br from-[##090979] via-[#dce5eb] to-[#cdd3db]">
        <div class="mx-auto w-full py-2">
          <router-outlet></router-outlet>
        </div>
      </main>
</div> -->

<!-- custom dynamic -->
<div class="flex flex-1 pt-[60px] overflow-hidden" [style.background-image]="gradient$ | async">
  <main class="w-full px-1 py-2 flex-grow overflow-y-scroll hide-scrollbar">
    <div class="mx-auto w-full py-2">
      <router-outlet></router-outlet>
    </div>
  </main>
</div>

<!-- <div class="flex flex-1 pt-[60px] overflow-hidden" style="background-image: linear-gradient(90.1deg, hsl(191, 84.90%, 20.80%) 14.5%, rgba(198,231,249,1) 135.4%)">
  <main class="w-full px-1 py-2 flex-grow overflow-y-scroll hide-scrollbar bg-transparent">
    <div class="mx-auto w-full py-2">
      <router-outlet></router-outlet>
    </div>
  </main>
</div> -->

</div>

  `,
  styleUrl: './mainlayout.component.css',
  imports: [RouterModule,AsyncPipe, HeaderComponent],
})
export class MainLayoutComponent { 
  gradient$!: Observable<string>;
    constructor(private themeService: ThemeService) {}

    ngOnInit() {
      this.gradient$ = this.themeService.currentGradient$;
      // this.gradient$.subscribe(newValue => {
      //   console.log('New gradient value in component:', newValue); // Log emitted value
      // });
    }

}



