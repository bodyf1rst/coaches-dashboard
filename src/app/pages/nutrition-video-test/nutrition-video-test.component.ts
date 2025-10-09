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
  // PHASE 7: Side-by-side video display
  loading = true;
  error: string | null = null;

  // Video library and playback states
  allVideos: VideoData[] = [];
  playingVideos: boolean[] = [];
  showTranscription: boolean[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.loading = true;
    this.error = null;
    const apiUrl = `${environment.apiUrl}/get-videos.php`;

    this.http.get<ApiResponse>(apiUrl).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.videos.length > 0) {
          this.allVideos = response.videos;

          // Initialize playback and transcription states for each video
          this.playingVideos = new Array(this.allVideos.length).fill(false);
          this.showTranscription = new Array(this.allVideos.length).fill(false);

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

  toggleVideo(index: number) {
    this.playingVideos[index] = !this.playingVideos[index];
  }

  toggleTranscriptionForVideo(index: number) {
    this.showTranscription[index] = !this.showTranscription[index];
  }
}
