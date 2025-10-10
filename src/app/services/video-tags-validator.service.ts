import { Injectable } from '@angular/core';
import { VideoData, VideoValidationResult, WorkoutType } from '../models/video.model';

/**
 * Video Tags Validator Service
 * Validates API responses and provides helpful warnings
 * Created: October 9, 2025 - Phase 7
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

  constructor() {}

  /**
   * Validate a single video
   */
  validateVideo(video: VideoData): VideoValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check critical fields only (video_id is optional for display)
    if (!video.video_title || video.video_title.trim() === '') {
      errors.push('Missing or empty video_title');
    }

    if (!video.videoUrl && !video.video_url) {
      errors.push('Missing video URL');
    }

    if (!video.thumbnailUrl) {
      warnings.push('Missing thumbnail URL');
    }

    // Check Phase 4: workout_type
    if (!video.workout_type) {
      warnings.push('Missing workout_type (Phase 4 field)');
    } else if (!this.validWorkoutTypes.includes(video.workout_type)) {
      warnings.push(`Invalid workout_type: "${video.workout_type}". Expected one of: ${this.validWorkoutTypes.join(', ')}`);
    }

    // Check Phase 5: muscle_groups (workout_tags)
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

    // Check equipment_tags
    if (!video.equipment_tags || video.equipment_tags.length === 0) {
      warnings.push('Missing equipment_tags');
    }

    // Check transcription
    if (!video.transcription || video.transcription.trim() === '') {
      warnings.push('Missing transcription');
    }

    // Check duration
    if (!video.duration) {
      warnings.push('Missing duration');
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
   * Sanitize and clean video data
   */
  sanitizeVideo(video: VideoData): VideoData {
    return {
      ...video,
      video_title: video.video_title?.trim() || 'Untitled Video',
      workout_tags: this.cleanTags(video.workout_tags),
      equipment_tags: this.cleanTags(video.equipment_tags),
      workout_type: video.workout_type || undefined
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
