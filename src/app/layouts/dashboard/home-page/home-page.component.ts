import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  imports:[CommonModule]
})
export class HomePageComponent {
  featuredProducts = [
    {
      name: 'Smartphone X',
      description: 'Revolutionary technology awaits',
      image: 'https://images.unsplash.com/photo-1612198273689-b437f53152ca'
    },
    {
      name: 'Wireless Headphones',
      description: 'Immersive sound experience',
      image: 'https://images.unsplash.com/photo-1612198273689-b437f53152ca'
    },
    {
      name: 'Smart TV',
      description: 'Cinematic visuals at home',
      image: 'https://images.unsplash.com/photo-1612198273689-b437f53152ca'
    },
    {
      name: 'Portable Speaker',
      description: 'High-quality audio on the go',
      image: 'https://images.unsplash.com/photo-1612198273689-b437f53152ca'
    },
    {
      name: 'Gaming Console',
      description: 'Next-gen gaming performance',
      image: 'https://images.unsplash.com/photo-1612198273689-b437f53152ca'
    }
  ];

  scrollGallery(direction: 'left' | 'right') {
    const gallery = document.querySelector('.scrollbar-thin') as HTMLElement;
    if (gallery) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}