/**
 * Video Data Models
 * Strict TypeScript interfaces for video library system
 * Created: October 9, 2025
 */

/**
 * Workout Type - Phase 4 classification
 */
export type WorkoutType =
  | 'resistance'
  | 'strength'
  | 'cardio'
  | 'power'
  | 'functional'
  | 'isometric'
  | 'endurance'
  | 'flexibility';

/**
 * Video format/resolution
 */
export type VideoFormat = '360P' | '720P' | '1080P' | '4K';

/**
 * Video category
 */
export type VideoCategory = 'workout' | 'nutrition' | 'mindset' | 'recovery';

/**
 * Main video data interface
 */
export interface VideoData {
  video_id: string;
  video_title: string;
  videoUrl: string;
  video_url?: string;  // Backward compatibility
  thumbnailUrl: string;
  thumbnailFallbacks?: string[];
  transcription?: string;
  duration?: string;
  category?: VideoCategory;
  workout_type?: WorkoutType;
  workout_tags?: string[];  // Muscle groups: chest, back, quads, etc.
  equipment_tags?: string[];  // Equipment: dumbbells, bodyweight, etc.
  tags?: string[];  // Legacy tags field
  is_active?: boolean;
  video_format?: VideoFormat;
}

/**
 * API Response interface
 */
export interface VideoApiResponse {
  status: 'success' | 'error';
  videos: VideoData[];
  total: number;
  page?: number;
  total_page?: number;
  message?: string;
  error?: string;
}

/**
 * Video validation result
 */
export interface VideoValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  video: VideoData;
}

/**
 * Filter state for video library
 */
export interface VideoFilterState {
  searchTerm: string;
  workoutTypes: WorkoutType[];
  muscleGroups: string[];
  equipment: string[];
}
