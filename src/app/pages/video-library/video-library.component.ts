import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { S3VideoService, VideoMetadata } from '../../service/s3-video.service';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'app-video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.scss']
})
export class VideoLibraryComponent implements OnInit {
  videos: VideoMetadata[] = [];
  filteredVideos: VideoMetadata[] = [];
  selectedCategory: string = 'all';
  searchQuery: string = '';
  selectedTags: string[] = [];
  availableTags: string[] = [];
  loading: boolean = false;
  selectedVideo: VideoMetadata | null = null;
  showVideoModal: boolean = false;

  // Multi-select functionality
  multiSelectMode: boolean = false;
  selectedVideoIds: Set<string> = new Set();

  // 4 Filter dropdowns
  selectedMuscleGroup: string = 'all';
  selectedEquipment: string = 'all';
  selectedDifficulty: string = 'all';
  selectedBodyArea: string = 'all';

  categories = [
    { value: 'all', label: 'All Videos', icon: '🎬' },
    { value: 'workout', label: 'Workout', icon: '🏋️' },
    { value: 'nutrition', label: 'Nutrition', icon: '🍎' },
    { value: 'mindset', label: 'Mindset', icon: '🧠' },
    { value: 'notification', label: 'Notifications', icon: '📣' }
  ];

  // Filter dropdown options
  muscleGroups = [
    { value: 'all', label: 'All Muscle Groups' },
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'legs', label: 'Legs' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'arms', label: 'Arms' },
    { value: 'core', label: 'Core' },
    { value: 'glutes', label: 'Glutes' }
  ];

  equipmentOptions = [
    { value: 'all', label: 'All Equipment' },
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'resistance band', label: 'Resistance Bands' },
    { value: 'cable', label: 'Cable' },
    { value: 'machine', label: 'Machine' }
  ];

  difficultyLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  bodyAreas = [
    { value: 'all', label: 'All Body Areas' },
    { value: 'upper body', label: 'Upper Body' },
    { value: 'lower body', label: 'Lower Body' },
    { value: 'full body', label: 'Full Body' },
    { value: 'core', label: 'Core' }
  ];

  constructor(
    private s3VideoService: S3VideoService,
    public dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.loading = true;

    // Load all videos in a single API call
    this.s3VideoService.getVideosByCategory('all').subscribe(
      videos => {
        this.videos = videos;
        this.extractTags();
        this.applyFilters();
        this.loading = false;
      },
      error => {
        if (this.dataService.utils && typeof this.dataService.utils.showToast === 'function') {
          this.dataService.utils.showToast('danger', 'Error loading videos');
        }
        this.loading = false;
      }
    );
  }

  extractTags(): void {
    const tagSet = new Set<string>();
    this.videos.forEach(video => {
      if (video.tags && Array.isArray(video.tags)) {
        video.tags.forEach(tag => tagSet.add(tag));
      }
    });
    this.availableTags = Array.from(tagSet).sort();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.videos];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.category === this.selectedCategory);
    }

    // Filter by muscle group
    if (this.selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(v =>
        v.tags && v.tags.some(tag =>
          tag.toLowerCase().includes(this.selectedMuscleGroup.toLowerCase())
        )
      );
    }

    // Filter by equipment
    if (this.selectedEquipment !== 'all') {
      filtered = filtered.filter(v =>
        v.tags && v.tags.some(tag =>
          tag.toLowerCase().includes(this.selectedEquipment.toLowerCase())
        )
      );
    }

    // Filter by difficulty
    if (this.selectedDifficulty !== 'all') {
      filtered = filtered.filter(v =>
        v.tags && v.tags.some(tag =>
          tag.toLowerCase().includes(this.selectedDifficulty.toLowerCase())
        )
      );
    }

    // Filter by body area
    if (this.selectedBodyArea !== 'all') {
      filtered = filtered.filter(v =>
        v.tags && v.tags.some(tag =>
          tag.toLowerCase().includes(this.selectedBodyArea.toLowerCase())
        )
      );
    }

    // Filter by tags
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(v =>
        v.tags && v.tags.some(tag => this.selectedTags.includes(tag))
      );
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        (v.transcription && v.transcription.toLowerCase().includes(query)) ||
        (v.tags && v.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    this.filteredVideos = filtered;
  }

  openVideoModal(video: VideoMetadata): void {
    this.selectedVideo = video;
    this.showVideoModal = true;
    // Transcription is already loaded in the initial API response, no need to fetch again
  }

  closeVideoModal(): void {
    this.showVideoModal = false;
    this.selectedVideo = null;
  }

  getThumbnailUrl(video: VideoMetadata): string {
    if (video.thumbnailUrl) {
      return video.thumbnailUrl;
    }
    // Fallback to default thumbnail
    return 'assets/default-thumb.png';
  }

  getVideoUrl(video: VideoMetadata): string {
    if (video.videoUrl) {
      return video.videoUrl;
    }
    // Construct S3 URL from key
    return this.s3VideoService.getS3VideoUrl(video.s3Key);
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  deleteVideo(video: VideoMetadata, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
      this.s3VideoService.deleteVideo(video.id).subscribe(
        () => {
          this.videos = this.videos.filter(v => v.id !== video.id);
          this.applyFilters();
          if (this.dataService.utils && typeof this.dataService.utils.showToast === 'function') {
            this.dataService.utils.showToast('success', 'Video deleted successfully');
          }
        },
        error => {
          console.error('Error deleting video:', error);
          if (this.dataService.utils && typeof this.dataService.utils.showToast === 'function') {
            this.dataService.utils.showToast('danger', 'Error deleting video');
          }
        }
      );
    }
  }

  generateThumbnail(video: VideoMetadata, event: Event): void {
    event.stopPropagation();

    this.s3VideoService.generateThumbnail(video.id).subscribe(
      response => {
        video.thumbnailUrl = response.thumbnailUrl;
        if (this.dataService.utils && typeof this.dataService.utils.showToast === 'function') {
          this.dataService.utils.showToast('success', 'Thumbnail generated successfully');
        }
      },
      error => {
        console.error('Error generating thumbnail:', error);
        if (this.dataService.utils && typeof this.dataService.utils.showToast === 'function') {
          this.dataService.utils.showToast('danger', 'Error generating thumbnail');
        }
      }
    );
  }

  clearFilters(): void {
    this.selectedCategory = 'all';
    this.selectedMuscleGroup = 'all';
    this.selectedEquipment = 'all';
    this.selectedDifficulty = 'all';
    this.selectedBodyArea = 'all';
    this.selectedTags = [];
    this.searchQuery = '';
    this.applyFilters();
  }

  // Multi-select functionality
  toggleMultiSelectMode(): void {
    this.multiSelectMode = !this.multiSelectMode;
    if (!this.multiSelectMode) {
      this.selectedVideoIds.clear();
    }
  }

  toggleVideoSelection(videoId: string): void {
    if (this.selectedVideoIds.has(videoId)) {
      this.selectedVideoIds.delete(videoId);
    } else {
      this.selectedVideoIds.add(videoId);
    }
  }

  isVideoSelected(videoId: string): boolean {
    return this.selectedVideoIds.has(videoId);
  }

  addSelectedToWorkout(): void {
    if (this.selectedVideoIds.size === 0) {
      if (this.dataService.utils && typeof this.dataService.utils.showToast === 'function') {
        this.dataService.utils.showToast('warning', 'Please select at least one video');
      }
      return;
    }

    // Navigate to workout builder with selected video IDs
    const videoIds = Array.from(this.selectedVideoIds);
    this.router.navigate(['/workout-builder'], {
      queryParams: { videoIds: videoIds.join(',') }
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onImageError(event: Event, video?: VideoMetadata): void {
    const target = event.target as HTMLImageElement;

    // Prevent infinite loop - mark that we tried this image
    if ((target as any)._errorAttempted) {
      console.log('Image load failed permanently for:', video?.title);
      return; // Stop trying
    }
    (target as any)._errorAttempted = true;

    // Try fallback URLs if available
    if (video && (video as any).thumbnailFallbacks && (video as any).thumbnailFallbacks.length > 0) {
      const nextFallback = (video as any).thumbnailFallbacks.shift();
      console.log('Trying fallback thumbnail:', nextFallback);
      target.src = nextFallback;
      (target as any)._errorAttempted = false; // Allow retry for new URL
    } else {
      // NO default thumbnail - just show broken image or placeholder div
      console.warn('No thumbnail available for:', video?.title);
      target.style.display = 'none'; // Hide broken image
    }
  }

  /**
   * Classify a tag and return the appropriate CSS class for styling
   * @param tag - The tag string to classify
   * @returns CSS class name for the tag
   */
  getTagClass(tag: string): string {
    const tagUpper = tag.toUpperCase();

    // Muscle Group Tags (Blue shades) - specific muscle names
    const muscleGroups = ['QUADS', 'GLUTES', 'HAMSTRINGS', 'CALVES', 'BICEPS', 'TRICEPS',
                          'SHOULDERS', 'CHEST', 'BACK', 'LATS', 'TRAPS', 'ABS', 'OBLIQUES',
                          'FOREARMS', 'DELTS', 'PECS', 'RHOMBOIDS', 'ERECTORS'];
    if (muscleGroups.some(muscle => tagUpper.includes(muscle))) {
      return 'muscle-group';
    }

    // Body Area Tags (Green shades) - general body regions
    const bodyAreas = ['LEGS', 'UPPER', 'CORE', 'LOWER BODY', 'UPPER BODY', 'FULL BODY', 'ARMS'];
    if (bodyAreas.some(area => tagUpper === area || tagUpper.includes(area))) {
      return 'body-area';
    }

    // Category Tags (Orange/Yellow shades) - workout types
    const categories = ['WORKOUT', 'CARDIO', 'GENERAL', 'STRENGTH', 'HIIT', 'STRETCHING',
                       'MOBILITY', 'WARM UP', 'COOL DOWN', 'CONDITIONING'];
    if (categories.some(cat => tagUpper === cat || tagUpper.includes(cat))) {
      return 'category';
    }

    // Difficulty Tags (Purple/Pink shades)
    const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EASY', 'MODERATE', 'HARD', 'EXPERT'];
    if (difficulties.some(diff => tagUpper === diff || tagUpper.includes(diff))) {
      return 'difficulty';
    }

    // Equipment Tags (Teal/Cyan shades)
    const equipment = ['DUMBBELLS', 'DUMBBELL', 'BARBELL', 'KETTLEBELL', 'RESISTANCE BAND',
                      'BODYWEIGHT', 'CABLE', 'MACHINE', 'BENCH', 'PULL-UP BAR', 'MEDICINE BALL',
                      'PLATES', 'BANDS', 'NO EQUIPMENT', 'WEIGHTS'];
    if (equipment.some(equip => tagUpper.includes(equip))) {
      return 'equipment';
    }

    // Default fallback
    return 'default';
  }
}
