import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

// TypeScript interfaces for type safety
interface VideoData {
  video_id: string;
  video_title: string;
  videoUrl: string;
  thumbnailUrl: string;
  transcription?: string;
  duration?: string;
  category?: string;
  workout_tags?: string[];
  equipment_tags?: string[];
}

interface ApiResponse {
  status: string;
  videos: VideoData[];
  total: number;
}

@Component({
  selector: 'app-nutrition-video-test',
  templateUrl: './nutrition-video-test.component.html',
  styleUrls: ['./nutrition-video-test.component.scss']
})
export class NutritionVideoTestComponent implements OnInit {
  // PHASE 7: Multiple videos with selection
  loading = true;
  error: string | null = null;

  // Video display states
  showVideo = false;
  showTranscription = false;

  // Video library
  allVideos: VideoData[] = [];
  selectedVideoIndex = 0;

  // Currently displayed video data
  videoUrl = '';
  thumbnailUrl = '';
  title = '';
  transcription = '';
  duration = '';
  category = '';
  workoutTags: string[] = [];
  equipmentTags: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.loading = true;
    this.error = null;
    // STEP 1: Single video test - Ab Roll Out only
    const apiUrl = `${environment.apiUrl}/get-single-test-video.php`;

    this.http.get<ApiResponse>(apiUrl).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.videos.length > 0) {
          // Store all videos
          this.allVideos = response.videos;

          // Select first video by default
          this.selectVideo(0);

          this.loading = false;
          console.log(`Loaded ${this.allVideos.length} videos successfully`);
        } else {
          this.error = 'No video data available';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading videos:', err);
        this.error = 'Failed to load videos. Please try again.';
        this.loading = false;
      }
    });
  }

  selectVideo(index: number) {
    if (index < 0 || index >= this.allVideos.length) return;

    const video = this.allVideos[index];
    this.selectedVideoIndex = index;

    // Populate display from selected video
    this.title = video.video_title;
    this.videoUrl = video.videoUrl;
    this.thumbnailUrl = video.thumbnailUrl;
    this.duration = video.duration || '1:00';
    this.category = video.category || 'Nutrition';
    this.transcription = video.transcription || 'No transcription available';
    this.workoutTags = video.workout_tags || [];
    this.equipmentTags = video.equipment_tags || [];

    // Reset video player when switching videos
    this.showVideo = false;
    this.showTranscription = false;

    console.log('Selected video:', this.title);
  }

  playVideo() {
    this.showVideo = true;
  }

  toggleTranscription() {
    this.showTranscription = !this.showTranscription;
  }
}
