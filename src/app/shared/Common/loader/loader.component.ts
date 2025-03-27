// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-loader',
//   imports: [],
//   templateUrl: './loader.component.html',
//   styleUrl: './loader.component.css'
// })
// export class LoaderComponent {

// }

import { Component } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service'
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-loading',
  imports:[CommonModule],
  providers:[LoadingService],
  templateUrl: './loader.component.html',
    styleUrl: './loader.component.css'
  })
export class LoadingComponent {
  isLoading$: any;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.isLoading$ = this.loadingService.isLoading$;
  }
}