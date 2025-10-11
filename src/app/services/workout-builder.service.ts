/**
 * Workout Builder Service
 * Created: October 11, 2025
 * Phase 3: Frontend Implementation - Task 2
 *
 * Provides methods to interact with the 10 Backend APIs from Phase 2
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  WorkoutTemplate,
  CreateTemplateRequest,
  TemplateListResponse,
  CreateWorkoutWithVideosRequest,
  WorkoutWithExercisesResponse,
  WorkoutPlanEnhanced,
  WorkoutPlanSchedule,
  BulkAssignment,
  BulkAssignResponse,
  OrganizationClientsResponse,
  VideoCompletionAward,
  VideoCompletionAwardResponse,
  WorkoutCompletionAward,
  WorkoutCompletionAwardResponse
} from '../models/workout-builder.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutBuilderService {
  private apiUrl: string;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  // ============================================================================
  // CATEGORY 1: TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Get all workout templates for a coach (system + custom templates)
   * @param coachId - The coach's ID
   * @returns Observable of template list response
   */
  getTemplates(coachId: number): Observable<TemplateListResponse> {
    const url = `${this.apiUrl}/workouts/templates/list.php?coach_id=${coachId}`;
    return this.http.get<TemplateListResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new custom workout template
   * @param template - Template data
   * @returns Observable of created template
   */
  createTemplate(template: CreateTemplateRequest): Observable<{success: boolean, template: WorkoutTemplate}> {
    const url = `${this.apiUrl}/workouts/templates/create.php`;
    return this.http.post<{success: boolean, template: WorkoutTemplate}>(url, template, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // CATEGORY 2: ENHANCED WORKOUT CREATION
  // ============================================================================

  /**
   * Create a new workout with videos, exercises, and optional BodyPoints configuration
   * @param workout - Complete workout data including exercises
   * @returns Observable of created workout
   */
  createWorkoutWithVideos(workout: CreateWorkoutWithVideosRequest): Observable<{success: boolean, workout_id: number}> {
    const url = `${this.apiUrl}/workouts/create-with-videos.php`;
    return this.http.post<{success: boolean, workout_id: number}>(url, workout, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a workout with all its exercises and video details
   * @param workoutId - The workout ID
   * @returns Observable of workout with exercises
   */
  getWorkoutWithExercises(workoutId: number): Observable<WorkoutWithExercisesResponse> {
    const url = `${this.apiUrl}/workouts/get-with-exercises.php?workout_id=${workoutId}`;
    return this.http.get<WorkoutWithExercisesResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // CATEGORY 3: WORKOUT PLAN MANAGEMENT
  // ============================================================================

  /**
   * Create an enhanced workout plan with 2-7 workouts
   * @param plan - Plan data with workout IDs
   * @returns Observable of created plan
   */
  createEnhancedPlan(plan: WorkoutPlanEnhanced): Observable<{success: boolean, plan_id: number}> {
    const url = `${this.apiUrl}/workout-plans/create-enhanced.php`;
    return this.http.post<{success: boolean, plan_id: number}>(url, plan, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Schedule a workout plan for a client or organization
   * @param schedule - Schedule configuration
   * @returns Observable of schedule result
   */
  schedulePlan(schedule: WorkoutPlanSchedule): Observable<{success: boolean, message: string}> {
    const url = `${this.apiUrl}/workout-plans/schedule.php`;
    return this.http.post<{success: boolean, message: string}>(url, schedule, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // CATEGORY 4: ORGANIZATION BULK ASSIGNMENT
  // ============================================================================

  /**
   * Bulk assign a workout plan to all clients in an organization
   * @param assignment - Plan and organization IDs
   * @returns Observable of bulk assignment result
   */
  bulkAssign(assignment: BulkAssignment): Observable<BulkAssignResponse> {
    const url = `${this.apiUrl}/assignments/bulk-assign.php`;
    return this.http.post<BulkAssignResponse>(url, assignment, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all clients in an organization
   * @param organizationId - The organization ID
   * @returns Observable of organization clients
   */
  getOrganizationClients(organizationId: number): Observable<OrganizationClientsResponse> {
    const url = `${this.apiUrl}/organizations/clients.php?organization_id=${organizationId}`;
    return this.http.get<OrganizationClientsResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // CATEGORY 5: BODYPOINTS INTEGRATION
  // ============================================================================

  /**
   * Award BodyPoints for completing a video in a workout
   * @param award - Client, workout, and video IDs
   * @returns Observable of points awarded
   */
  awardVideoCompletion(award: VideoCompletionAward): Observable<VideoCompletionAwardResponse> {
    const url = `${this.apiUrl}/bodypoints/award-video-completion.php`;
    return this.http.post<VideoCompletionAwardResponse>(url, award, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Award BodyPoints bonus for completing an entire workout
   * @param award - Client and workout IDs
   * @returns Observable of bonus awarded
   */
  awardWorkoutCompletion(award: WorkoutCompletionAward): Observable<WorkoutCompletionAwardResponse> {
    const url = `${this.apiUrl}/bodypoints/award-workout-completion.php`;
    return this.http.post<WorkoutCompletionAwardResponse>(url, award, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  /**
   * Handle HTTP errors
   * @param error - The error response
   * @returns Observable error
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error (${error.status}): ${error.message}`;

      // Try to extract error message from API response
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.error) {
        errorMessage = error.error.error;
      }
    }

    console.error('Workout Builder Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate workout plan constraints (2-7 workouts)
   * @param workoutIds - Array of workout IDs
   * @returns Validation result
   */
  validateWorkoutPlanConstraints(workoutIds: number[]): { valid: boolean; message?: string } {
    if (workoutIds.length < 2) {
      return {
        valid: false,
        message: 'A workout plan must contain at least 2 workouts'
      };
    }

    if (workoutIds.length > 7) {
      return {
        valid: false,
        message: 'A workout plan cannot contain more than 7 workouts'
      };
    }

    return { valid: true };
  }

  /**
   * Calculate estimated workout duration based on exercises
   * @param exerciseCount - Number of exercises
   * @param avgSets - Average sets per exercise
   * @param avgReps - Average reps per set
   * @param avgRestTime - Average rest time in seconds
   * @returns Estimated duration in minutes
   */
  calculateEstimatedDuration(
    exerciseCount: number,
    avgSets: number = 3,
    avgReps: number = 12,
    avgRestTime: number = 60
  ): number {
    // Rough estimate: 3 seconds per rep + rest time between sets
    const timePerSet = (avgReps * 3) + avgRestTime;
    const totalTimeSeconds = exerciseCount * avgSets * timePerSet;
    return Math.ceil(totalTimeSeconds / 60); // Convert to minutes
  }
}
