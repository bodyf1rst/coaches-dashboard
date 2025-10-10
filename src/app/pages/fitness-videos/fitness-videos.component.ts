import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VideoData, VideoApiResponse } from '../../models/video.model';
import { VideoTagsValidatorService } from '../../services/video-tags-validator.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-fitness-videos',
  templateUrl: './fitness-videos.component.html',
  styleUrls: ['./fitness-videos.component.scss']
})
export class FitnessVideosComponent implements OnInit, OnDestroy {
  // PHASE 7: Side-by-side video display
  loading = true;
  error: string | null = null;

  // Video library and playback states
  allVideos: VideoData[] = [];
  filteredVideos: VideoData[] = []; // TASK 8: Filtered results
  videoRows: VideoData[][] = []; // Grouped into rows of 4 for grid display
  playingVideos: boolean[] = [];
  showTranscription: boolean[] = [];

  // TASK 8: Search & Filter UI
  searchQuery = '';
  selectedWorkoutType = '';
  selectedMuscleGroups: string[] = [];
  selectedEquipment: string[] = [];
  private searchSubject = new Subject<string>();

  // TASK 8: Filter options (populated from data)
  workoutTypes: string[] = [];
  muscleGroupOptions: string[] = [];
  equipmentOptions: string[] = [];

  constructor(
    private http: HttpClient,
    private validator: VideoTagsValidatorService
  ) {}

  ngOnInit() {
    this.loadVideos();

    // TASK 8: Set up search debouncing (300ms delay)
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchText => {
        this.searchQuery = searchText;
        this.applyFilters();
      });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  loadVideos() {
    this.loading = true;
    this.error = null;
    // NEW TASK C: Add category filter for Fitness videos only
    const apiUrl = `${environment.apiUrl}/get-videos.php?category=Fitness`;

    console.log('📡 Fetching FITNESS videos from API:', apiUrl);

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

          this.loading = false;

          // Log validation summary
          const validationSummary = this.validator.validateVideos(this.allVideos, false);
          console.log(`✅ Loaded ${this.allVideos.length} valid videos`);
          if (invalidVideos.length > 0) {
            console.warn(`⚠️ Filtered out ${invalidVideos.length} invalid videos`);
          }

          // TASK 8: Extract unique filter options from data
          this.extractFilterOptions();

          // TASK 8: Initially show all videos
          this.filteredVideos = [...this.allVideos];
          this.updateVideoRows();
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

  /**
   * TASK 8: Extract unique filter options from video data
   */
  private extractFilterOptions() {
    const workoutTypeSet = new Set<string>();
    const muscleGroupSet = new Set<string>();
    const equipmentSet = new Set<string>();

    this.allVideos.forEach(video => {
      // Collect workout types
      if (video.workout_type) {
        workoutTypeSet.add(video.workout_type);
      }

      // Collect muscle groups
      if (video.workout_tags && Array.isArray(video.workout_tags)) {
        video.workout_tags.forEach(tag => {
          if (tag && tag.trim()) {
            muscleGroupSet.add(tag.trim());
          }
        });
      }

      // Collect equipment
      if (video.equipment_tags && Array.isArray(video.equipment_tags)) {
        video.equipment_tags.forEach(tag => {
          if (tag && tag.trim()) {
            equipmentSet.add(tag.trim());
          }
        });
      }
    });

    // Convert sets to sorted arrays
    this.workoutTypes = Array.from(workoutTypeSet).sort();
    this.muscleGroupOptions = Array.from(muscleGroupSet).sort();
    this.equipmentOptions = Array.from(equipmentSet).sort();

    console.log(`🔍 Filter Options Extracted:`, {
      workoutTypes: this.workoutTypes.length,
      muscleGroups: this.muscleGroupOptions.length,
      equipment: this.equipmentOptions.length
    });
  }

  /**
   * TASK 8: Handle search input with debouncing
   */
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  /**
   * TASK 8: Apply all active filters
   */
  applyFilters() {
    let filtered = [...this.allVideos];

    // Filter by search query (title)
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(video =>
        video.video_title.toLowerCase().includes(query)
      );
    }

    // Filter by workout type
    if (this.selectedWorkoutType) {
      filtered = filtered.filter(video =>
        video.workout_type === this.selectedWorkoutType
      );
    }

    // Filter by muscle groups (must have ALL selected)
    if (this.selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(video => {
        if (!video.workout_tags || !Array.isArray(video.workout_tags)) {
          return false;
        }
        return this.selectedMuscleGroups.every(selected =>
          video.workout_tags?.includes(selected) || false
        );
      });
    }

    // Filter by equipment (must have ALL selected)
    if (this.selectedEquipment.length > 0) {
      filtered = filtered.filter(video => {
        if (!video.equipment_tags || !Array.isArray(video.equipment_tags)) {
          return false;
        }
        return this.selectedEquipment.every(selected =>
          video.equipment_tags?.includes(selected) || false
        );
      });
    }

    this.filteredVideos = filtered;
    this.updateVideoRows();

    console.log(`🔍 Filters Applied: ${filtered.length} of ${this.allVideos.length} videos`);
  }

  /**
   * TASK 8: Update video rows after filtering
   */
  private updateVideoRows() {
    this.videoRows = this.chunkVideos(this.filteredVideos, 4);
    // Reset playback states for filtered videos
    this.playingVideos = new Array(this.filteredVideos.length).fill(false);
    this.showTranscription = new Array(this.filteredVideos.length).fill(false);
  }

  /**
   * TASK 8: Toggle muscle group selection
   */
  toggleMuscleGroup(muscleGroup: string) {
    const index = this.selectedMuscleGroups.indexOf(muscleGroup);
    if (index > -1) {
      this.selectedMuscleGroups.splice(index, 1);
    } else {
      this.selectedMuscleGroups.push(muscleGroup);
    }
    this.applyFilters();
  }

  /**
   * TASK 8: Toggle equipment selection
   */
  toggleEquipment(equipment: string) {
    const index = this.selectedEquipment.indexOf(equipment);
    if (index > -1) {
      this.selectedEquipment.splice(index, 1);
    } else {
      this.selectedEquipment.push(equipment);
    }
    this.applyFilters();
  }

  /**
   * TASK 8: Clear all filters
   */
  clearFilters() {
    this.searchQuery = '';
    this.selectedWorkoutType = '';
    this.selectedMuscleGroups = [];
    this.selectedEquipment = [];
    this.filteredVideos = [...this.allVideos];
    this.updateVideoRows();
    console.log('🔍 All filters cleared');
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
