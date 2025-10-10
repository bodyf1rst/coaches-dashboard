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

    console.log('📡 Fetching videos from API:', apiUrl);

    this.http.get<VideoApiResponse>(apiUrl).subscribe({
      next: (response) => {
        try {
          // TASK 7: Comprehensive API response validation
          const validationResult = this.validateApiResponse(response);

          if (!validationResult.isValid) {
            this.error = validationResult.errorMessage;
            this.loading = false;
            console.error('❌ API Response Validation Failed:', validationResult.errorMessage);
            return;
          }

          // Clean and sanitize video data using validator service
          this.allVideos = response.videos.map((video: VideoData) => {
            const sanitized = this.validator.sanitizeVideo(video);
            return {
              ...sanitized,
              // Clean video_title: remove resolution tags like (360P), (1080P)
              video_title: this.cleanTitle(sanitized.video_title),
              // Clean workout_tags: remove quotes, brackets, only A-Z and spaces
              workout_tags: this.cleanTags(sanitized.workout_tags),
              // Clean equipment_tags: remove quotes, brackets, only A-Z and spaces
              equipment_tags: this.cleanTags(sanitized.equipment_tags)
            };
          });

          // Validate each video and filter out invalid ones
          const validVideos: VideoData[] = [];
          const invalidVideos: VideoData[] = [];

          this.allVideos.forEach(video => {
            const result = this.validator.validateVideo(video);
            if (result.isValid) {
              validVideos.push(video);
            } else {
              invalidVideos.push(video);
              console.error(`❌ Invalid video: ${video.video_title}`, result.errors);
            }
          });

          // Use only valid videos
          this.allVideos = validVideos;

          if (this.allVideos.length === 0) {
            this.error = 'No valid videos found. All videos failed validation.';
            this.loading = false;
            return;
          }

          // Initialize playback and transcription states for each video
          this.playingVideos = new Array(this.allVideos.length).fill(false);
          this.showTranscription = new Array(this.allVideos.length).fill(false);

          // Group videos into rows of 4 for grid display
          this.videoRows = this.chunkVideos(this.allVideos, 4);

          this.loading = false;

          // Log validation summary
          const validationSummary = this.validator.validateVideos(this.allVideos, false);
          console.log(`✅ Loaded ${this.allVideos.length} valid videos`);
          if (invalidVideos.length > 0) {
            console.warn(`⚠️ Filtered out ${invalidVideos.length} invalid videos`);
          }
        } catch (processingError) {
          console.error('❌ Error processing API response:', processingError);
          this.error = 'Error processing video data. Please contact support.';
          this.loading = false;
        }
      },
      error: (err) => {
        // TASK 7: Enhanced error handling with specific messages
        console.error('❌ API Request Failed:', err);

        let errorMessage = 'Failed to load videos. ';

        if (err.status === 0) {
          errorMessage += 'Network error - please check your internet connection.';
        } else if (err.status === 404) {
          errorMessage += 'API endpoint not found. Please contact support.';
        } else if (err.status === 500) {
          errorMessage += 'Server error. Please try again later.';
        } else if (err.status === 403) {
          errorMessage += 'Access denied. Please check your permissions.';
        } else if (err.error?.message) {
          errorMessage += err.error.message;
        } else {
          errorMessage += 'Unknown error. Please try again.';
        }

        this.error = errorMessage;
        this.loading = false;
      }
    });
  }

  /**
   * TASK 7: Validate API response structure
   * Ensures response has required fields and proper format
   */
  private validateApiResponse(response: any): { isValid: boolean; errorMessage: string } {
    // Check if response exists
    if (!response) {
      return {
        isValid: false,
        errorMessage: 'Empty response from API. Please try again.'
      };
    }

    // Check if response has status field
    if (!response.status) {
      return {
        isValid: false,
        errorMessage: 'Invalid API response format (missing status field).'
      };
    }

    // Check if status is success
    if (response.status !== 'success') {
      const apiMessage = response.message || 'Unknown API error';
      return {
        isValid: false,
        errorMessage: `API returned error: ${apiMessage}`
      };
    }

    // Check if videos array exists
    if (!response.videos) {
      return {
        isValid: false,
        errorMessage: 'API response missing videos data.'
      };
    }

    // Check if videos is an array
    if (!Array.isArray(response.videos)) {
      return {
        isValid: false,
        errorMessage: 'Invalid videos data format (expected array).'
      };
    }

    // Check if videos array is not empty
    if (response.videos.length === 0) {
      return {
        isValid: false,
        errorMessage: 'No videos available. Please check your data source.'
      };
    }

    // Check if response has total field (optional but expected)
    if (!response.total && response.total !== 0) {
      console.warn('⚠️ API response missing total field');
    }

    // All validation passed
    return {
      isValid: true,
      errorMessage: ''
    };
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
