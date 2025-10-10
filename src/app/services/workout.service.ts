import { Injectable } from '@angular/core';
import { HttpService } from '../service/http.service';
import {
  WorkoutPlan,
  Workout,
  WorkoutExercise,
  WorkoutAssignment,
  WorkoutProgress,
  CreateWorkoutPlanRequest,
  CreateWorkoutRequest,
  AddExerciseRequest,
  AssignWorkoutRequest,
  LogProgressRequest,
  WorkoutPlanWithWorkouts,
  WorkoutWithDetails
} from '../models/workout.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  // API endpoint paths
  private workoutPlansPaths = {
    create: 'workout-plans/create.php',
    list: 'workout-plans/list.php',
    get: 'workout-plans/get.php',
    update: 'workout-plans/update.php',
    delete: 'workout-plans/delete.php'
  };

  private workoutsPaths = {
    create: 'workouts/create.php',
    list: 'workouts/list.php',
    get: 'workouts/get.php',
    update: 'workouts/update.php',
    delete: 'workouts/delete.php'
  };

  private exercisesPaths = {
    add: 'workout-exercises/add.php',
    remove: 'workout-exercises/remove.php'
  };

  private assignmentsPaths = {
    assign: 'assignments/assign.php',
    progress: 'assignments/progress.php'
  };

  constructor(private httpService: HttpService) {}

  // ==================== WORKOUT PLANS ====================

  async createWorkoutPlan(data: CreateWorkoutPlanRequest): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.workoutPlansPaths.create, data);
    } catch (error) {
      console.error('Error creating workout plan:', error);
      throw error;
    }
  }

  async listWorkoutPlans(): Promise<any> {
    try {
      return await this.httpService.getApiData(this.workoutPlansPaths.list);
    } catch (error) {
      console.error('Error listing workout plans:', error);
      throw error;
    }
  }

  async getWorkoutPlan(planId: number): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.workoutPlansPaths.get, { plan_id: planId });
    } catch (error) {
      console.error('Error getting workout plan:', error);
      throw error;
    }
  }

  async updateWorkoutPlan(planId: number, data: Partial<WorkoutPlan>): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.workoutPlansPaths.update, {
        plan_id: planId,
        ...data
      });
    } catch (error) {
      console.error('Error updating workout plan:', error);
      throw error;
    }
  }

  async deleteWorkoutPlan(planId: number): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.workoutPlansPaths.delete, { plan_id: planId });
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      throw error;
    }
  }

  // ==================== WORKOUTS ====================

  async createWorkout(data: CreateWorkoutRequest): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.workoutsPaths.create, data);
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  }

  async listWorkouts(planId?: number): Promise<any> {
    try {
      const endpoint = planId
        ? `${this.workoutsPaths.list}?plan_id=${planId}`
        : this.workoutsPaths.list;
      return await this.httpService.getApiData(endpoint);
    } catch (error) {
      console.error('Error listing workouts:', error);
      throw error;
    }
  }

  async getWorkout(workoutId: number): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.workoutsPaths.get, { workout_id: workoutId });
    } catch (error) {
      console.error('Error getting workout:', error);
      throw error;
    }
  }

  async updateWorkout(workoutId: number, data: Partial<Workout>): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.workoutsPaths.update, {
        workout_id: workoutId,
        ...data
      });
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  }

  async deleteWorkout(workoutId: number): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.workoutsPaths.delete, { workout_id: workoutId });
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }

  // ==================== WORKOUT EXERCISES ====================

  async addExercise(data: AddExerciseRequest): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.exercisesPaths.add, data);
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  }

  async removeExercise(exerciseId: number): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.exercisesPaths.remove, { exercise_id: exerciseId });
    } catch (error) {
      console.error('Error removing exercise:', error);
      throw error;
    }
  }

  // ==================== ASSIGNMENTS ====================

  async assignWorkoutPlan(data: AssignWorkoutRequest): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.assignmentsPaths.assign, data);
    } catch (error) {
      console.error('Error assigning workout plan:', error);
      throw error;
    }
  }

  async logProgress(data: LogProgressRequest): Promise<any> {
    try {
      return await this.httpService.postApiDataWithJson(this.assignmentsPaths.progress, data);
    } catch (error) {
      console.error('Error logging progress:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Reorder exercises in a workout
   */
  async reorderExercises(workoutId: number, exerciseIds: number[]): Promise<void> {
    try {
      // Remove all exercises
      const workout = await this.getWorkout(workoutId);
      if (workout.success && workout.data.exercises) {
        for (const exercise of workout.data.exercises) {
          await this.removeExercise(exercise.id);
        }
      }

      // Re-add in new order
      for (let i = 0; i < exerciseIds.length; i++) {
        const exercise = workout.data.exercises.find((ex: any) => ex.id === exerciseIds[i]);
        if (exercise) {
          await this.addExercise({
            workout_id: workoutId,
            exercise_id: exercise.exercise_id,
            exercise_order: i + 1,
            sets: exercise.sets,
            reps: exercise.reps,
            duration_seconds: exercise.duration_seconds,
            weight: exercise.weight,
            rest_seconds: exercise.rest_seconds,
            rest_timer_seconds: exercise.rest_timer_seconds,
            timer_beep_enabled: exercise.timer_beep_enabled,
            notes: exercise.notes
          });
        }
      }
    } catch (error) {
      console.error('Error reordering exercises:', error);
      throw error;
    }
  }

  /**
   * Clone a workout plan
   */
  async cloneWorkoutPlan(planId: number, newName: string): Promise<any> {
    try {
      const planResponse = await this.getWorkoutPlan(planId);
      if (!planResponse.success) {
        throw new Error('Failed to get workout plan');
      }

      const plan = planResponse.data;
      const newPlan = await this.createWorkoutPlan({
        name: newName,
        description: plan.description,
        duration_weeks: plan.duration_weeks,
        is_public: plan.is_public
      });

      if (!newPlan.success) {
        throw new Error('Failed to create new plan');
      }

      // Clone workouts
      const workoutsResponse = await this.listWorkouts(planId);
      if (workoutsResponse.success && workoutsResponse.data) {
        for (const workout of workoutsResponse.data) {
          const newWorkout = await this.createWorkout({
            plan_id: newPlan.data.id,
            day_of_week: workout.day_of_week,
            week_number: workout.week_number,
            workout_type: workout.workout_type,
            name: workout.name,
            description: workout.description,
            duration_minutes: workout.duration_minutes,
            config_json: workout.config_json
          });

          // Clone exercises
          if (newWorkout.success && workout.exercises) {
            for (const exercise of workout.exercises) {
              await this.addExercise({
                workout_id: newWorkout.data.id,
                exercise_id: exercise.exercise_id,
                exercise_order: exercise.exercise_order,
                sets: exercise.sets,
                reps: exercise.reps,
                duration_seconds: exercise.duration_seconds,
                weight: exercise.weight,
                rest_seconds: exercise.rest_seconds,
                rest_timer_seconds: exercise.rest_timer_seconds,
                timer_beep_enabled: exercise.timer_beep_enabled,
                notes: exercise.notes
              });
            }
          }
        }
      }

      return newPlan;
    } catch (error) {
      console.error('Error cloning workout plan:', error);
      throw error;
    }
  }
}
