import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-workout-programming',
  templateUrl: './workout-programming.component.html',
  styleUrls: ['./workout-programming.component.scss']
})
export class WorkoutProgrammingComponent implements OnInit {
  programmingForm: FormGroup;
  clients: any[] = [];
  workouts: any[] = [];
  selectedClient: any = null;
  currentWeek: Date = new Date();
  isLoading = false;
  isSaving = false;

  weekDays = [
    { name: 'Monday', key: 'monday' },
    { name: 'Tuesday', key: 'tuesday' },
    { name: 'Wednesday', key: 'wednesday' },
    { name: 'Thursday', key: 'thursday' },
    { name: 'Friday', key: 'friday' },
    { name: 'Saturday', key: 'saturday' },
    { name: 'Sunday', key: 'sunday' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadClients();
    this.loadWorkouts();
  }

  initializeForm() {
    this.programmingForm = this.fb.group({
      client_id: ['', Validators.required],
      week_start: [this.getWeekStart(), Validators.required],
      notes: [''],
      workouts: this.fb.array([])
    });
  }

  get workoutsArray() {
    return this.programmingForm.get('workouts') as FormArray;
  }

  getWeekStart(): string {
    const start = new Date(this.currentWeek);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return start.toISOString().split('T')[0];
  }

  async loadClients() {
    try {
      this.isLoading = true;
      const response: any = await this.http.get(`${environment.apiUrl}/admin/clients`).toPromise();
      if (response.status) {
        this.clients = response.data;
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadWorkouts() {
    try {
      const response: any = await this.http.get(`${environment.apiUrl}/admin/workouts`).toPromise();
      if (response.status) {
        this.workouts = response.data;
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  }

  onClientSelect(client: any) {
    this.selectedClient = client;
    this.programmingForm.patchValue({ client_id: client.id });
    this.loadClientWeeklyProgram();
  }

  async loadClientWeeklyProgram() {
    if (!this.selectedClient) return;

    try {
      this.isLoading = true;
      const weekStart = this.getWeekStart();
      const response: any = await this.http.get(
        `${environment.apiUrl}/admin/client-weekly-workouts/${this.selectedClient.id}?week_start=${weekStart}`
      ).toPromise();

      if (response.status && response.data) {
        this.populateFormWithExistingProgram(response.data);
      } else {
        this.initializeEmptyWeek();
      }
    } catch (error) {
      console.error('Error loading client program:', error);
      this.initializeEmptyWeek();
    } finally {
      this.isLoading = false;
    }
  }

  populateFormWithExistingProgram(programData: any) {
    this.workoutsArray.clear();
    
    this.weekDays.forEach(day => {
      const dayWorkouts = programData[day.key] || [];
      dayWorkouts.forEach((workout: any) => {
        this.workoutsArray.push(this.fb.group({
          day: [day.key],
          workout_id: [workout.workout_id, Validators.required],
          scheduled_time: [workout.scheduled_time || ''],
          notes: [workout.notes || '']
        }));
      });
    });
  }

  initializeEmptyWeek() {
    this.workoutsArray.clear();
  }

  addWorkoutToDay(day: string) {
    this.workoutsArray.push(this.fb.group({
      day: [day],
      workout_id: ['', Validators.required],
      scheduled_time: [''],
      notes: ['']
    }));
  }

  removeWorkout(index: number) {
    this.workoutsArray.removeAt(index);
  }

  getWorkoutsForDay(day: string) {
    return this.workoutsArray.controls.filter(control => control.get('day')?.value === day);
  }

  getWorkoutName(workoutId: number): string {
    const workout = this.workouts.find(w => w.id === workoutId);
    return workout ? workout.name : 'Select Workout';
  }

  async saveWeeklyProgram() {
    if (this.programmingForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      this.isSaving = true;
      const formData = this.programmingForm.value;
      
      const response: any = await this.http.post(
        `${environment.apiUrl}/admin/program-weekly-workouts`,
        formData
      ).toPromise();

      if (response.status) {
        alert('Weekly program saved successfully!');
        this.loadClientWeeklyProgram(); // Refresh the data
      } else {
        alert('Error saving program: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Error saving program. Please try again.');
    } finally {
      this.isSaving = false;
    }
  }

  markFormGroupTouched() {
    Object.keys(this.programmingForm.controls).forEach(key => {
      const control = this.programmingForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          Object.keys(arrayControl.value).forEach(arrayKey => {
            arrayControl.get(arrayKey)?.markAsTouched();
          });
        });
      }
    });
  }

  previousWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() - 7);
    this.programmingForm.patchValue({ week_start: this.getWeekStart() });
    if (this.selectedClient) {
      this.loadClientWeeklyProgram();
    }
  }

  nextWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() + 7);
    this.programmingForm.patchValue({ week_start: this.getWeekStart() });
    if (this.selectedClient) {
      this.loadClientWeeklyProgram();
    }
  }

  getWeekDisplay(): string {
    const start = new Date(this.getWeekStart());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
}
