import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.scss']
})
export class VideoLibraryComponent implements OnInit {
  public videos: any[] = [];
  public filteredVideos: any[] = [];
  public selectedVideos: Set<number> = new Set();
  public searchQuery: string = '';
  public searchText: string = '';
  public selectedCategory: string = 'all';
  public loading: boolean = false;
  public categories = [
    { value: 'all', label: 'All Videos' },
    { value: 'workout', label: 'Workout/Exercise' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'mindset', label: 'Mindset/Spirit' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'notification', label: 'Push Notifications' }
  ];

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.loading = true;
    console.log('Loading videos...');
    this.dataService.getVideos().then((res: any) => {
      console.log('Videos response:', res);
      if (res.status === 200 || res.status === 'success') {
        this.videos = res.videos || [];
        // Use URLs directly from API - they're already correct!
        this.videos.forEach(video => {
          video.selected = false;
          // API already provides video_url and thumbnailUrl - don't overwrite them
          // Just ensure we have fallbacks
          if (!video.thumbnailUrl && video.video_title) {
            const videoName = video.video_title.replace(/\.mp4$/i, '');
            video.thumbnailUrl = `https://bodyf1rst-workout-video-storage.s3.amazonaws.com/thumbnails/${videoName}.jpg`;
          }
          if (!video.video_url && video.video_title) {
            video.video_url = `https://bodyf1rst-workout-video-storage.s3.amazonaws.com/${video.video_title}`;
          }
        });
        this.filteredVideos = [...this.videos];
        console.log('Loaded videos:', this.videos.length);
      }
      this.loading = false;
    }).catch((error) => {
      console.error('Error loading videos:', error);
      this.loading = false;
    });
  }

  filterVideos(): void {
    this.filteredVideos = this.videos.filter(video => {
      const matchesSearch = !this.searchQuery ||
        video.video_title?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' ||
        video.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  toggleVideoSelection(video: any): void {
    video.selected = !video.selected;
    if (video.selected) {
      this.selectedVideos.add(video.id);
    } else {
      this.selectedVideos.delete(video.id);
    }
  }

  selectAll(): void {
    this.filteredVideos.forEach(video => {
      video.selected = true;
      this.selectedVideos.add(video.id);
    });
  }

  clearSelection(): void {
    this.filteredVideos.forEach(video => {
      video.selected = false;
    });
    this.selectedVideos.clear();
  }

  addToWorkout(): void {
    const selected = Array.from(this.selectedVideos);
    if (selected.length > 0) {
      this.dataService.router.navigate(['/workout-builder'], {
        queryParams: { videos: selected.join(',') }
      });
    }
  }

  onImageError(event: any): void {
    event.target.src = '/assets/default-thumb.png';
  }

  searchVideos(): void {
    if (!this.searchText) {
      this.filteredVideos = [...this.videos];
    } else {
      const query = this.searchText.toLowerCase();
      this.filteredVideos = this.videos.filter(video =>
        video.video_title?.toLowerCase().includes(query) ||
        video.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
  }

  public selectedVideo: any = null;
  public showVideoModal: boolean = false;

  playVideo(video: any): void {
    if (video.video_url) {
      this.selectedVideo = video;
      this.showVideoModal = true;
    }
  }

  closeVideoModal(): void {
    this.showVideoModal = false;
    this.selectedVideo = null;
  }

  handleThumbnailError(video: any, event: any): void {
    video.thumbnailError = true;
    event.target.style.display = 'none';
  }
}
