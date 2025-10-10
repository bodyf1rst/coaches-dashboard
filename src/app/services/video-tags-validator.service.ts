import { Injectable } from '@angular/core';
import { VideoData, VideoValidationResult, WorkoutType } from '../models/video.model';

/**
 * Video Tags Validator Service
 * Validates API responses and provides helpful warnings
 * Created: October 9, 2025 - Phase 7
 * Enhanced: October 10, 2025 - Task 7 (URL validation, duration checks, error recovery)
 */
@Injectable({
  providedIn: 'root'
})
export class VideoTagsValidatorService {

  private readonly validWorkoutTypes: WorkoutType[] = [
    'resistance', 'strength', 'cardio', 'power',
    'functional', 'isometric', 'endurance', 'flexibility'
  ];

  private readonly commonMuscleGroups = [
    'chest', 'back', 'biceps', 'triceps', 'shoulders', 'delts',
    'quads', 'hamstrings', 'glutes', 'calves', 'legs',
    'abs', 'core', 'forearms', 'neck', 'full_body', 'cardio'
  ];

  // Default fallback values for error recovery
  private readonly DEFAULT_THUMBNAIL = 'assets/images/default-video-thumbnail.jpg';
  private readonly DEFAULT_TITLE = 'Untitled Workout Video';
  private readonly DEFAULT_TRANSCRIPTION = 'No description available for this video.';
  private readonly MIN_DURATION = 0;
  private readonly MAX_DURATION = 7200; // 2 hours max

  constructor() {}

  /**
   * Validate S3 URL format
   */
  private isValidS3Url(url: string): boolean {
    if (!url) return false;

    // S3 URL patterns:
    // - https://bucket-name.s3.amazonaws.com/path/file.mp4
    // - https://bucket-name.s3.region.amazonaws.com/path/file.mp4
    // - https://s3.amazonaws.com/bucket-name/path/file.mp4
    const s3Pattern = /^https?:\/\/([a-z0-9.-]+\.s3[.-][a-z0-9-]*\.amazonaws\.com|s3\.amazonaws\.com\/[a-z0-9.-]+)\/.+\.(mp4|webm|mov)$/i;

    return s3Pattern.test(url);
  }

  /**
   * Validate duration value
   */
  private isValidDuration(duration: any): boolean {
    if (!duration) return false;

    const num = Number(duration);
    return !isNaN(num) && num >= this.MIN_DURATION && num <= this.MAX_DURATION;
  }

  /**
   * Get error recovery value for video URL
   */
  getRecoveryVideoUrl(video: VideoData): string | null {
    const primaryUrl = video.videoUrl || video.video_url;

    if (primaryUrl && this.isValidS3Url(primaryUrl)) {
      return primaryUrl;
    }

    // Try alternate URL field
    const alternateUrl = video.video_url || video.videoUrl;
    if (alternateUrl && this.isValidS3Url(alternateUrl)) {
      console.warn(`⚠️ Using alternate URL field for video: ${video.video_title}`);
      return alternateUrl;
    }

    // No valid URL found
    console.error(`❌ No valid video URL found for: ${video.video_title}`);
    return null;
  }

  /**
   * Get error recovery value for thumbnail
   */
  getRecoveryThumbnailUrl(video: VideoData): string {
    if (video.thumbnailUrl && video.thumbnailUrl.trim()) {
      return video.thumbnailUrl;
    }

    // Try to generate thumbnail URL from video URL
    const videoUrl = video.videoUrl || video.video_url;
    if (videoUrl && this.isValidS3Url(videoUrl)) {
      const thumbnailUrl = videoUrl.replace(/\.(mp4|webm|mov)$/i, '-thumbnail.jpg');
      console.warn(`⚠️ Generated fallback thumbnail for: ${video.video_title}`);
      return thumbnailUrl;
    }

    // Use default thumbnail
    console.warn(`⚠️ Using default thumbnail for: ${video.video_title}`);
    return this.DEFAULT_THUMBNAIL;
  }

  /**
   * Get error recovery value for title
   */
  getRecoveryTitle(video: VideoData): string {
    if (video.video_title && video.video_title.trim()) {
      return video.video_title.trim();
    }

    // Try to generate title from video filename
    const videoUrl = video.videoUrl || video.video_url;
    if (videoUrl) {
      const match = videoUrl.match(/\/([^/]+)\.(mp4|webm|mov)$/i);
      if (match) {
        const filename = decodeURIComponent(match[1]).replace(/[-_]/g, ' ');
        console.warn(`⚠️ Generated title from filename for video ID: ${video.video_id}`);
        return filename;
      }
    }

    return this.DEFAULT_TITLE;
  }

  /**
   * Get error recovery value for transcription
   */
  getRecoveryTranscription(video: VideoData): string {
    if (video.transcription && video.transcription.trim()) {
      return video.transcription.trim();
    }

    console.warn(`⚠️ Missing transcription for: ${video.video_title || 'Unknown'}`);
    return this.DEFAULT_TRANSCRIPTION;
  }

  /**
   * Get error recovery value for duration
   */
  getRecoveryDuration(video: VideoData): string {
    if (this.isValidDuration(video.duration)) {
      return String(video.duration);
    }

    console.warn(`⚠️ Invalid or missing duration for: ${video.video_title || 'Unknown'}`);
    return '0'; // Return '0' to indicate unknown duration
  }

  /**
   * Apply all error recovery strategies to a video
   */
  applyErrorRecovery(video: VideoData): VideoData {
    return {
      ...video,
      video_title: this.getRecoveryTitle(video),
      videoUrl: this.getRecoveryVideoUrl(video) || video.videoUrl,
      video_url: this.getRecoveryVideoUrl(video) || video.video_url,
      thumbnailUrl: this.getRecoveryThumbnailUrl(video),
      transcription: this.getRecoveryTranscription(video),
      duration: this.getRecoveryDuration(video),
      workout_tags: this.cleanTags(video.workout_tags),
      equipment_tags: this.cleanTags(video.equipment_tags),
      workout_type: video.workout_type || undefined
    };
  }

  /**
   * Validate a single video (ENHANCED - Task 7)
   */
  validateVideo(video: VideoData): VideoValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    // CRITICAL FIELD: Title
    if (!video.video_title || video.video_title.trim() === '') {
      errors.push('Missing or empty video_title');
    }

    // CRITICAL FIELD: Video URL (lenient validation)
    const primaryUrl = video.videoUrl || video.video_url;
    if (!primaryUrl) {
      errors.push('Missing video URL - cannot play');
    } else {
      // Just check if it looks like a URL at all
      if (!primaryUrl.startsWith('http://') && !primaryUrl.startsWith('https://')) {
        warnings.push(`Video URL doesn't start with http/https: ${primaryUrl}`);
      }
      // S3 pattern validation is advisory only - don't block videos
      if (!this.isValidS3Url(primaryUrl)) {
        // This is OK - URLs might be rawurlencoded or use different S3 formats
        // Don't add warning, just let it through
      }
    }

    // IMPORTANT FIELD: Thumbnail URL (warning only, has fallback)
    if (!video.thumbnailUrl) {
      warnings.push('Missing thumbnail URL - will use fallback');
    }

    // VALIDATION: Duration (lenient - warnings only)
    if (!video.duration) {
      warnings.push('Missing duration');
    } else if (!this.isValidDuration(video.duration)) {
      const num = Number(video.duration);
      if (isNaN(num)) {
        warnings.push(`Invalid duration format: ${video.duration} - will show as unknown`);
      } else if (num < this.MIN_DURATION) {
        warnings.push(`Duration suspicious: ${num}s (seems too small)`);
      } else if (num > this.MAX_DURATION) {
        warnings.push(`Duration suspicious: ${num}s (seems too large)`);
      }
    }

    // VALIDATION: workout_type (Phase 4)
    if (!video.workout_type) {
      warnings.push('Missing workout_type (Phase 4 field)');
    } else if (!this.validWorkoutTypes.includes(video.workout_type)) {
      warnings.push(`Invalid workout_type: "${video.workout_type}". Expected one of: ${this.validWorkoutTypes.join(', ')}`);
    }

    // VALIDATION: muscle_groups (workout_tags - Phase 5)
    if (!video.workout_tags || video.workout_tags.length === 0) {
      warnings.push('Missing workout_tags (muscle groups - Phase 5 field)');
    } else {
      // Check for invalid muscle groups
      const invalidGroups = video.workout_tags.filter(
        tag => !this.commonMuscleGroups.includes(tag.toLowerCase())
      );
      if (invalidGroups.length > 0) {
        warnings.push(`Unusual muscle groups: ${invalidGroups.join(', ')}`);
      }
    }

    // VALIDATION: equipment_tags
    if (!video.equipment_tags || video.equipment_tags.length === 0) {
      warnings.push('Missing equipment_tags');
    }

    // VALIDATION: transcription
    if (!video.transcription || video.transcription.trim() === '') {
      warnings.push('Missing transcription - will use fallback text');
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      warnings,
      errors,
      video
    };
  }

  /**
   * Validate an array of videos and log results
   */
  validateVideos(videos: VideoData[], verbose: boolean = false): {
    valid: number;
    invalid: number;
    totalWarnings: number;
  } {
    let validCount = 0;
    let invalidCount = 0;
    let totalWarnings = 0;

    videos.forEach((video, index) => {
      const result = this.validateVideo(video);

      if (result.isValid) {
        validCount++;
      } else {
        invalidCount++;
        console.error(`❌ Video ${index + 1} (${video.video_title || 'Unknown'}) has errors:`, result.errors);
      }

      if (result.warnings.length > 0) {
        totalWarnings += result.warnings.length;
        if (verbose) {
          console.warn(`⚠️ Video ${index + 1} (${video.video_title || 'Unknown'}) has warnings:`, result.warnings);
        }
      }
    });

    // Summary log
    console.group('🔍 Video Validation Summary');
    console.log(`✅ Valid videos: ${validCount}/${videos.length}`);
    console.log(`❌ Invalid videos: ${invalidCount}/${videos.length}`);
    console.log(`⚠️ Total warnings: ${totalWarnings}`);
    console.groupEnd();

    return {
      valid: validCount,
      invalid: invalidCount,
      totalWarnings
    };
  }

  /**
   * Check if a video has all three tag fields
   */
  hasCompleteTagData(video: VideoData): boolean {
    return !!(
      video.workout_type &&
      video.workout_tags && video.workout_tags.length > 0 &&
      video.equipment_tags && video.equipment_tags.length > 0
    );
  }

  /**
   * Get missing fields for a video
   */
  getMissingFields(video: VideoData): string[] {
    const missing: string[] = [];

    if (!video.workout_type) missing.push('workout_type');
    if (!video.workout_tags || video.workout_tags.length === 0) missing.push('workout_tags');
    if (!video.equipment_tags || video.equipment_tags.length === 0) missing.push('equipment_tags');
    if (!video.transcription) missing.push('transcription');
    if (!video.thumbnailUrl) missing.push('thumbnailUrl');
    if (!video.duration) missing.push('duration');

    return missing;
  }

  /**
   * Sanitize and clean video data (ENHANCED - Task 7)
   */
  sanitizeVideo(video: VideoData): VideoData {
    return {
      ...video,
      video_title: video.video_title?.trim() || this.DEFAULT_TITLE,
      workout_tags: this.cleanTags(video.workout_tags),
      equipment_tags: this.cleanTags(video.equipment_tags),
      workout_type: video.workout_type || undefined,
      transcription: video.transcription?.trim() || this.DEFAULT_TRANSCRIPTION
    };
  }

  /**
   * Get user-friendly error message for display
   */
  getUserFriendlyError(video: VideoData, result: VideoValidationResult): string {
    if (result.isValid) {
      return '';
    }

    const videoTitle = video.video_title || 'Unknown Video';

    if (result.errors.length > 0) {
      // Critical errors - video cannot be displayed
      return `⚠️ "${videoTitle}" has critical errors and cannot be played. ${result.errors[0]}`;
    }

    if (result.warnings.length > 0) {
      // Warnings only - video can be displayed with fallbacks
      return `ℹ️ "${videoTitle}" is missing some information. Using default values.`;
    }

    return '';
  }

  /**
   * Get notification severity level
   */
  getNotificationSeverity(result: VideoValidationResult): 'error' | 'warning' | 'info' {
    if (result.errors.length > 0) {
      return 'error';
    }
    if (result.warnings.length > 0) {
      return 'warning';
    }
    return 'info';
  }

  /**
   * Batch validate and apply error recovery to all videos
   */
  validateAndRecoverVideos(videos: VideoData[]): {
    videos: VideoData[];
    stats: {
      total: number;
      valid: number;
      recovered: number;
      failed: number;
    };
  } {
    let validCount = 0;
    let recoveredCount = 0;
    let failedCount = 0;

    const processedVideos = videos.map(video => {
      const result = this.validateVideo(video);

      if (result.isValid && result.warnings.length === 0) {
        validCount++;
        return video; // Perfect video, no changes needed
      }

      if (result.errors.length > 0) {
        failedCount++;
        console.error(`❌ CRITICAL: Video "${video.video_title || 'Unknown'}" has errors:`, result.errors);
        // Try recovery anyway
        const recovered = this.applyErrorRecovery(video);
        const revalidated = this.validateVideo(recovered);
        if (revalidated.isValid) {
          recoveredCount++;
          console.log(`✅ RECOVERED: "${video.video_title || 'Unknown'}"`);
          return recovered;
        }
        return video; // Return original if recovery failed
      }

      if (result.warnings.length > 0) {
        recoveredCount++;
        console.warn(`⚠️ RECOVERING: "${video.video_title || 'Unknown'}" - ${result.warnings.length} warnings`);
        return this.applyErrorRecovery(video);
      }

      return video;
    });

    console.group('🔍 Video Validation & Recovery Summary');
    console.log(`📊 Total videos: ${videos.length}`);
    console.log(`✅ Valid videos: ${validCount}`);
    console.log(`🔧 Recovered videos: ${recoveredCount}`);
    console.log(`❌ Failed videos: ${failedCount}`);
    console.groupEnd();

    return {
      videos: processedVideos,
      stats: {
        total: videos.length,
        valid: validCount,
        recovered: recoveredCount,
        failed: failedCount
      }
    };
  }

  /**
   * Clean tags array (remove empty, trim, dedupe)
   */
  private cleanTags(tags: string[] | any): string[] {
    if (!tags || !Array.isArray(tags)) return [];

    return tags
      .map(tag => String(tag).trim())
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
  }
}
