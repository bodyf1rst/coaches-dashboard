// Workout Builder Models
// Based on database schema from create-workout-tables.sql

export type WorkoutType = 'traditional' | 'emom' | 'amrap' | 'circuit' | 'tabata' | 'superset' | 'custom';

export interface WorkoutPlan {
  id?: number;
  coach_id: number;
  name: string;
  description?: string;
  duration_weeks?: number;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Workout {
  id?: number;
  plan_id: number;
  day_of_week?: number;
  week_number?: number;
  workout_type: WorkoutType;
  name: string;
  description?: string;
  duration_minutes?: number;
  config_json?: string;
  created_at?: string;
  exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id?: number;
  workout_id: number;
  exercise_id: number;
  exercise_order: number;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  weight?: number;
  rest_seconds?: number;
  rest_timer_seconds?: number;
  timer_beep_enabled: boolean;
  notes?: string;
  created_at?: string;

  // Populated from video library
  exercise_name?: string;
  exercise_thumbnail?: string;
  exercise_video_url?: string;
}

export interface WorkoutAssignment {
  id?: number;
  plan_id: number;
  client_id: number;
  coach_id: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  assigned_at?: string;
}

export interface WorkoutProgress {
  id?: number;
  assignment_id: number;
  workout_id: number;
  completed_at: string;
  duration_minutes?: number;
  notes?: string;
  created_at?: string;
  exercises?: ExerciseProgress[];
}

export interface ExerciseProgress {
  id?: number;
  workout_progress_id: number;
  exercise_id: number;
  sets_completed: number;
  reps_completed: number;
  weight_used?: number;
  duration_seconds?: number;
  notes?: string;
  created_at?: string;
}

// Custom Template Structure
export interface CustomTemplateStructure {
  template_type: 'custom';
  name: string;
  structure: TemplateSection[];
}

export interface TemplateSection {
  type: WorkoutType | 'rest';
  name?: string;
  duration?: number;
  rounds?: number;
  exercises?: WorkoutExercise[];
}

// Frontend-only models for UI
export interface WorkoutWithDetails extends Workout {
  exercises: WorkoutExercise[];
  plan_name?: string;
}

export interface WorkoutPlanWithWorkouts extends WorkoutPlan {
  workouts: Workout[];
  workout_count?: number;
}

// API Request/Response models
export interface CreateWorkoutPlanRequest {
  name: string;
  description?: string;
  duration_weeks?: number;
  is_public: boolean;
}

export interface CreateWorkoutRequest {
  plan_id: number;
  day_of_week?: number;
  week_number?: number;
  workout_type: WorkoutType;
  name: string;
  description?: string;
  duration_minutes?: number;
  config_json?: string;
}

export interface AddExerciseRequest {
  workout_id: number;
  exercise_id: number;
  exercise_order: number;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  weight?: number;
  rest_seconds?: number;
  rest_timer_seconds?: number;
  timer_beep_enabled: boolean;
  notes?: string;
}

export interface AssignWorkoutRequest {
  plan_id: number;
  client_id: number;
  start_date: string;
  end_date?: string;
}

export interface LogProgressRequest {
  assignment_id: number;
  workout_id: number;
  completed_at: string;
  duration_minutes?: number;
  notes?: string;
  exercises: {
    exercise_id: number;
    sets_completed: number;
    reps_completed: number;
    weight_used?: number;
    duration_seconds?: number;
    notes?: string;
  }[];
}
