import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { VideoData, VideoApiResponse } from '../../models/video.model';
import { VideoTagsValidatorService } from '../../services/video-tags-validator.service';

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
  videoRows: VideoData[][] = []; // Grouped into rows of 4 for grid display
  playingVideos: boolean[] = [];
  showTranscription: boolean[] = [];

  constructor(
    private http: HttpClient,
    private validator: VideoTagsValidatorService
  ) {}

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.loading = true;
    this.error = null;
    const apiUrl = `${environment.apiUrl}/get-videos.php`;

    this.http.get<VideoApiResponse>(apiUrl).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.videos.length > 0) {
          // Clean and process video data
          this.allVideos = response.videos.map((video: VideoData) => ({
            ...video,
            // Clean video_title: remove resolution tags like (360P), (1080P)
            video_title: this.cleanTitle(video.video_title),
            // Clean workout_tags: remove quotes, brackets, only A-Z and spaces
            workout_tags: this.cleanTags(video.workout_tags),
            // Clean equipment_tags: remove quotes, brackets, only A-Z and spaces
            equipment_tags: this.cleanTags(video.equipment_tags)
          }));

          // Initialize playback and transcription states for each video
          this.playingVideos = new Array(this.allVideos.length).fill(false);
          this.showTranscription = new Array(this.allVideos.length).fill(false);

          // Group videos into rows of 4 for grid display
          this.videoRows = this.chunkVideos(this.allVideos, 4);

          this.loading = false;

          // Phase 7: Validate all videos
          this.validator.validateVideos(this.allVideos, false);

          console.log(`✅ Loaded ${this.allVideos.length} videos successfully`);
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

  // Clean video titles: Remove resolution tags for uniform appearance
  private cleanTitle(title: string): string {
    if (!title) return title;
    // Remove (360P), (1080P), (720P), etc. - case insensitive
    return title.replace(/\s*\(?\d+P\)?\s*/gi, '').trim();
  }

  // Chunk videos into rows for grid display
  private chunkVideos(videos: VideoData[], chunkSize: number): VideoData[][] {
    const rows: VideoData[][] = [];
    for (let i = 0; i < videos.length; i += chunkSize) {
      rows.push(videos.slice(i, i + chunkSize));
    }
    return rows;
  }
}
