// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-loader',
//   imports: [],
//   templateUrl: './loader.component.html',
//   styleUrl: './loader.component.css'
// })
// export class LoaderComponent {

// }

import { LoadingService } from '../../../core/services/loading.service'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule,ProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoadingComponent {
  isLoading$: Observable<boolean>;

  constructor(private loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.isLoading$;
  }
}