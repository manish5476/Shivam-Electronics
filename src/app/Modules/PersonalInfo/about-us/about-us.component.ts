// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-about-us',
//   imports: [],
//   templateUrl: './about-us.component.html',
//   styleUrl: './about-us.component.css'
// })
// export class AboutUsComponent {

// }
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

// Example interface for team member data
interface TeamMember {
  name: string;
  description: string;
  imageUrl: string;
  socialLinks: { icon: string; url: string; }[]; // icon: Font Awesome class
}

@Component({
  selector: 'app-about-us', // The selector for this component
  imports:[CommonModule],
  templateUrl: './about-us.component.html', // Link to the HTML template
  styleUrls: ['./about-us.component.css'] // Link to component-specific CSS
})
export class AboutUsComponent implements OnInit {

  // Array to hold team member data
  teamMembers: TeamMember[] = [];

  constructor() { }

  ngOnInit(): void {
    // Initialize team member data (replace with fetched data in a real app)
    this.teamMembers = [
      {
        name: 'Emma Hug',
        description: 'Founder and creative mind. She shapes the vision that defines our brand. Passionate about creating customer-focused solutions and strengthening team spirit.',
        imageUrl: 'https://images.unsplash.com/photo-1744578413523-33596836891b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8', // Replace with actual image path
        socialLinks: [
          { icon: 'fab fa-youtube', url: '' }, // Font Awesome classes
          { icon: 'fab fa-twitter', url: '' },
          { icon: 'fab fa-facebook-f', url: '' },
        ]
      },
       {
        name: 'Robert Smith',
        description: 'Product Designer. Focused on user experience, he delivers functional and aesthetic solutions. His attention to detail and innovative approach inspire our team.',
        imageUrl: 'https://images.unsplash.com/photo-1744578413523-33596836891b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8', // Replace with actual image path
        socialLinks: [
          { icon: 'fab fa-youtube', url: '' }, // Font Awesome classes
          { icon: 'fab fa-twitter', url: '' },
          { icon: 'fab fa-facebook-f', url: '' },
        ]
      },
       {
        name: 'Lia Anderson',
        description: 'Software Developer. With her technical expertise and creative mindset, she brings our projects to life. Her top priority is developing user-friendly solutions through code.',
        imageUrl: 'https://images.unsplash.com/photo-1744578413523-33596836891b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8', // Replace with actual image path
        socialLinks: [
          { icon: 'fab fa-youtube', url: '' }, // Font Awesome classes
          { icon: 'fab fa-twitter', url: 'https://x.com/' },
          { icon: 'fab fa-facebook-f', url: 'https://facebook.com/' },
        ]
      },
      // Add more team members as needed
    ];
  }

  // Helper function to determine layout direction
  // Used to apply 'md:flex-row' or 'md:flex-row-reverse' conditionally
  getFlexDirection(index: number): string {
    return index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse';
  }
}