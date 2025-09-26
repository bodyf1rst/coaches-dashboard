import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.scss']
})
export class VideoLibraryComponent implements OnInit {
  videos: any[] = [];
  filteredVideos: any[] = [];
  selectedCategory = 'all';
  searchText = '';
  isLoading = false;

  categories = [
    { value: 'all', label: 'All Videos' },
    { value: 'workout', label: 'Workouts' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'mindset', label: 'Mindset' },
    { value: 'marketing', label: 'Marketing' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.isLoading = true;
    // Mock data for now
    setTimeout(() => {
      this.videos = [
        {
          id: 1,
          title: 'Full Body Workout',
          category: 'workout',
          duration: '15:00',
          url: 'https://example.com/video1.mp4'
        },
        {
          id: 2,
          title: 'Nutrition Basics',
          category: 'nutrition',
          duration: '10:00',
          url: 'https://example.com/video2.mp4'
        },
        {
          id: 3,
          title: 'Mindfulness Meditation',
          category: 'mindset',
          duration: '20:00',
          url: 'https://example.com/video3.mp4'
        }
      ];
      this.filterVideos();
      this.isLoading = false;
    }, 1000);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterVideos();
  }

  onSearch(): void {
    this.filterVideos();
  }

  filterVideos(): void {
    this.filteredVideos = this.videos.filter(video => {
      const categoryMatch = this.selectedCategory === 'all' || video.category === this.selectedCategory;
      const searchMatch = !this.searchText || 
        video.title.toLowerCase().includes(this.searchText.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }
}
// Force rebuild at Thu Sep 25 20:14:00 CDT 2025
