/**
 * Workout Builder Enhancement - TypeScript Interfaces
 * Created: October 11, 2025
 * Phase 3: Frontend Implementation
 *
 * These interfaces match the Backend APIs created in Phase 2
 */

import { VideoData } from './video.model';

// ============================================================================
// CATEGORY 1: TEMPLATE MANAGEMENT
// ============================================================================

export interface WorkoutTemplate {
  id: number;
  name: string;
  type: 'strength' | 'cardio' | 'hiit' | 'mobility' | 'recovery' | 'custom';
  description?: string;
  is_system_template: boolean;
  coach_id?: number;
  created_at?: string;
}

export interface CreateTemplateRequest {
  name: string;
  type: string;
  description?: string;
  coach_id: number;
}

export interface TemplateListResponse {
  success: boolean;
  templates: WorkoutTemplate[];
  count?: number;
}

// ============================================================================
// CATEGORY 2: ENHANCED WORKOUT CREATION
// ============================================================================

export interface WorkoutExercise {
  video_id: number;
  order: number;
  sets: number;
  reps: number;
  rest_time_seconds: number;
  video?: VideoData; // Populated when fetching with exercises
}

export interface WorkoutBodyPoints {
  points_per_video: number;
  completion_bonus: number;
}

export interface CreateWorkoutWithVideosRequest {
  name: string;
  coach_id: number;
  template_id?: number;
  exercises: WorkoutExercise[];
  bodypoints?: WorkoutBodyPoints;
}

export interface WorkoutWithExercises {
  id: number;
  name: string;
  coach_id: number;
  template_id?: number;
  template?: WorkoutTemplate;
  exercises: WorkoutExercise[];
  bodypoints?: WorkoutBodyPoints;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutWithExercisesResponse {
  success: boolean;
  workout: WorkoutWithExercises;
}

// ============================================================================
// CATEGORY 3: WORKOUT PLAN MANAGEMENT
// ============================================================================

export interface WorkoutPlanEnhanced {
  name: string;
  coach_id: number;
  workout_ids: number[]; // min 2, max 7
}

export interface CreateEnhancedPlanRequest extends WorkoutPlanEnhanced {}

export interface WorkoutPlanSchedule {
  plan_id: number;
  target_type: 'client' | 'organization';
  target_id: number;
  schedule_day: string; // e.g., "Monday"
  schedule_time: string; // e.g., "09:00:00"
}

export interface SchedulePlanRequest extends WorkoutPlanSchedule {}

export interface WorkoutPlanWithWorkouts {
  id: number;
  name: string;
  coach_id: number;
  workouts: WorkoutWithExercises[];
  schedules?: WorkoutPlanSchedule[];
  created_at?: string;
}

// ============================================================================
// CATEGORY 4: ORGANIZATION BULK ASSIGNMENT
// ============================================================================

export interface BulkAssignment {
  plan_id: number;
  organization_id: number;
}

export interface BulkAssignRequest extends BulkAssignment {}

export interface BulkAssignResponse {
  success: boolean;
  message: string;
  assignments_created?: number;
  clients_affected?: number;
}

export interface OrganizationClient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  organization_id?: number;
  created_at?: string;
}

export interface OrganizationClientsResponse {
  success: boolean;
  clients: OrganizationClient[];
  count?: number;
}

// ============================================================================
// CATEGORY 5: BODYPOINTS INTEGRATION
// ============================================================================

export interface VideoCompletionAward {
  client_id: number;
  workout_id: number;
  video_id: number;
}

export interface VideoCompletionAwardRequest extends VideoCompletionAward {}

export interface VideoCompletionAwardResponse {
  success: boolean;
  message: string;
  points_awarded?: number;
  new_total?: number;
}

export interface WorkoutCompletionAward {
  client_id: number;
  workout_id: number;
}

export interface WorkoutCompletionAwardRequest extends WorkoutCompletionAward {}

export interface WorkoutCompletionAwardResponse {
  success: boolean;
  message: string;
  bonus_awarded?: number;
  new_total?: number;
}

// ============================================================================
// UI-SPECIFIC INTERFACES
// ============================================================================

export interface TemplateCategory {
  type: 'strength' | 'cardio' | 'hiit' | 'mobility' | 'recovery' | 'custom';
  icon: string;
  color: string;
  label: string;
}

export interface WorkoutBuilderFormData {
  name: string;
  selectedTemplate?: WorkoutTemplate;
  exercises: WorkoutExercise[];
  bodyPointsConfig?: WorkoutBodyPoints;
}

export interface PlanBuilderFormData {
  name: string;
  selectedWorkouts: WorkoutWithExercises[];
  schedules: WorkoutPlanSchedule[];
}

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const WORKOUT_PLAN_CONSTRAINTS = {
  MIN_WORKOUTS: 2,
  MAX_WORKOUTS: 7
} as const;

export const REST_TIME_CONSTRAINTS = {
  MIN_SECONDS: 30,
  MAX_SECONDS: 300,
  DEFAULT_SECONDS: 60
} as const;

export const BODYPOINTS_CONSTRAINTS = {
  MIN_POINTS_PER_VIDEO: 5,
  MAX_POINTS_PER_VIDEO: 50,
  DEFAULT_POINTS_PER_VIDEO: 15,
  MIN_COMPLETION_BONUS: 25,
  MAX_COMPLETION_BONUS: 200,
  DEFAULT_COMPLETION_BONUS: 75
} as const;

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { type: 'strength', icon: '💪', color: '#e74c3c', label: 'Strength Training' },
  { type: 'cardio', icon: '🏃', color: '#3498db', label: 'Cardio' },
  { type: 'hiit', icon: '⚡', color: '#f39c12', label: 'HIIT' },
  { type: 'mobility', icon: '🧘', color: '#9b59b6', label: 'Mobility' },
  { type: 'recovery', icon: '💆', color: '#1abc9c', label: 'Recovery' },
  { type: 'custom', icon: '⚙️', color: '#95a5a6', label: 'Custom' }
];
