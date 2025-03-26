// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-keenslidercommon',
//   imports: [],
//   templateUrl: './keenslidercommon.component.html',
//   styleUrl: './keenslidercommon.component.css'
// })
// export class KeenslidercommonComponent {

// }
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import KeenSlider, {
  KeenSliderInstance,
  KeenSliderPlugin,
} from "keen-slider";

function ThumbnailPlugin(main: KeenSliderInstance): KeenSliderPlugin {
  return (slider) => {
    function removeActive() {
      slider.slides.forEach((slide) => {
        slide.classList.remove("active");
      });
    }
    function addActive(idx: number) {
      slider.slides[idx].classList.add("active");
    }

    function addClickEvents() {
      slider.slides.forEach((slide, idx) => {
        slide.addEventListener("click", () => {
          main.moveToIdx(idx);
        });
      });
    }

    slider.on("created", () => {
      addActive(slider.track.details.rel);
      addClickEvents();
      main.on("animationStarted", (main:any) => {
        removeActive();
        const next = main.animator.targetIdx || 0;
        addActive(main.track.absToRel(next));
        slider.moveToIdx(Math.min(slider.track.details.maxIdx, next));
      });
    });
  };
}

@Component({
  selector: 'app-keenslidercommon',
  imports: [CommonModule],
  templateUrl: './keenslidercommon.component.html',
  styleUrl: './keenslidercommon.component.css'
})
export class KeenslidercommonComponent {

  @ViewChild("sliderRef") sliderRef!: ElementRef<HTMLElement>; // Definite assignment assertion
  @ViewChild("thumbnailRef") thumbnailRef!: ElementRef<HTMLElement>; // Definite assignment assertion

  @Input() slidesData: any[] = [];
  @Input() thumbnailPerView: number = 4;
  @Input() thumbnailSpacing: number = 10;

  slider: KeenSliderInstance | null = null;
  thumbnailSlider: KeenSliderInstance | null = null;

  ngAfterViewInit() {
    if (!this.sliderRef || !this.thumbnailRef) {
      console.error("sliderRef or thumbnailRef is not defined");
      return;
    }

    this.slider = new KeenSlider(this.sliderRef.nativeElement);
    this.thumbnailSlider = new KeenSlider(
      this.thumbnailRef.nativeElement,
      {
        initial: 0,
        slides: {
          perView: this.thumbnailPerView,
          spacing: this.thumbnailSpacing,
        },
      },
      [ThumbnailPlugin(this.slider)]
    );
  }

  ngOnDestroy() {
    if (this.slider) this.slider.destroy();
    if (this.thumbnailSlider) this.thumbnailSlider.destroy();
  }
}