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
  workout_type?: string;        // Phase 4: resistance, strength, cardio, etc.
  workout_tags?: string[];      // Muscle groups: chest, back, quads, etc.
  equipment_tags?: string[];    // Equipment: dumbbells, bodyweight, etc.
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
          // Clean and process video data
          this.allVideos = response.videos.map(video => ({
            ...video,
            // Clean workout_tags: remove quotes, brackets, only A-Z and spaces
            workout_tags: this.cleanTags(video.workout_tags),
            // Clean equipment_tags: remove quotes, brackets, only A-Z and spaces
            equipment_tags: this.cleanTags(video.equipment_tags)
          }));

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

  // Clean tags: Remove quotes, brackets, special chars - only keep A-Z and spaces
  private cleanTags(tags: string[] | any): string[] {
    if (!tags) return [];

    // If it's a string (shouldn't be, but handle it)
    if (typeof tags === 'string') {
      tags = [tags];
    }

    // Ensure it's an array
    if (!Array.isArray(tags)) {
      return [];
    }

    // Clean each tag: remove everything except letters and spaces
    return tags.map(tag => {
      let cleaned = String(tag)
        .replace(/[\[\]"'{}]/g, '')  // Remove brackets, quotes, braces
        .replace(/[^a-zA-Z\s]/g, '')  // Remove anything that's not a letter or space
        .trim();                      // Remove leading/trailing spaces

      // Capitalize first letter of each word
      return cleaned
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }).filter(tag => tag.length > 0);  // Remove empty tags
  }
}
