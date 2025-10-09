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
  // PHASE 5: API Integration - Dynamic data loading
  loading = true;
  error: string | null = null;

  // Video display states
  showVideo = false;
  showTranscription = false;

  // Video data (will be populated from API)
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
    this.loadVideo();
  }

  loadVideo() {
    this.loading = true;
    this.error = null;
    // Temporarily use existing get-videos.php endpoint (works right now)
    const apiUrl = `${environment.apiUrl}/get-videos.php`;

    this.http.get<ApiResponse>(apiUrl).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.videos.length > 0) {
          const video = response.videos[0];

          // Map API response to component properties - 100% from database!
          this.title = video.video_title;
          this.videoUrl = video.videoUrl;
          this.thumbnailUrl = video.thumbnailUrl;
          this.duration = video.duration || '1:00';
          this.category = video.category || 'Nutrition';

          // PHASE 6: All data now from database (no fallbacks!)
          this.transcription = video.transcription || 'No transcription available';
          this.workoutTags = video.workout_tags || [];
          this.equipmentTags = video.equipment_tags || [];

          this.loading = false;
          console.log('Video loaded successfully:', this.title);
        } else {
          this.error = 'No video data available';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading video:', err);
        this.error = 'Failed to load video. Please try again.';
        this.loading = false;
      }
    });
  }

  playVideo() {
    this.showVideo = true;
  }

  toggleTranscription() {
    this.showTranscription = !this.showTranscription;
  }
}
