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
    // Using actual S3 videos
    this.videos = [
      {
        id: 1,
        title: 'Ab Roll Out',
        category: 'workout',
        duration: '0:30',
        url: 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/Ab+Roll+Out.mov'
      },
      {
        id: 2,
        title: 'Ab Slider',
        category: 'workout',
        duration: '0:30',
        url: 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/Ab+Slider.mov'
      },
      {
        id: 3,
        title: 'Ab Wheel Roll Out',
        category: 'workout',
        duration: '0:30',
        url: 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/Ab+Wheel+Roll+Out.mov'
      },
      {
        id: 4,
        title: 'Adored Health',
        category: 'workout',
        duration: '0:30',
        url: 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/Adored+Health.mov'
      },
      {
        id: 5,
        title: 'Alternating High Pull',
        category: 'workout',
        duration: '0:30',
        url: 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/Alternating+High+Pull+Ups.mov'
      }
    ];
    this.filterVideos();
    this.isLoading = false;
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
