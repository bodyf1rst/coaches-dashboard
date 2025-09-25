import { Component, OnInit, OnDestroy } from '@angular/core';
// Drag and drop functionality - will be implemented with native HTML5 or alternative library
// import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';
import { Subscription } from 'rxjs';

// Enhanced Interfaces
export interface WorkoutVideo {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  duration: string;
  category: 'Workout/Exercise' | 'Nutrition' | 'Mindset/Spirit' | 'Marketing' | 'Push Notification';
  equipment: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  bodyParts?: string[];
  transcription?: string;
  autoTags?: string[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: 'AMRAP' | 'EMOM' | 'RFT' | 'Traditional' | 'Chipper' | 'Ladder';
  duration?: number;
  rounds?: number;
  exercises: WorkoutVideo[];
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string[];
  tags: string[];
  createdBy?: string;
  isPublic?: boolean;
}

export interface WeeklyPlan {
  id: string;
  name: string;
  startDate: Date;
  workouts: { [day: string]: WorkoutTemplate[] };
  clientId?: string;
  coachId: string;
  notes?: string;
}

@Component({
  selector: 'app-manage-workout',
  templateUrl: './manage-workout.component.html',
  styleUrls: ['./manage-workout.component.scss']
})
export class ManageWorkoutComponent implements OnInit, OnDestroy {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  // 🎨 Enhanced Workout Builder UX
  videoLibrary: WorkoutVideo[] = [];
  filteredVideos: WorkoutVideo[] = [];
  selectedVideos: Set<string> = new Set();
  currentWorkout: WorkoutVideo[] = [];
  workoutName = '';
  workoutType: 'AMRAP' | 'EMOM' | 'RFT' | 'Traditional' | 'Chipper' | 'Ladder' = 'Traditional';
  
  // ⏱️ Advanced Workout Types
  amrapSettings = { duration: 15, exercises: [] as WorkoutVideo[] };
  emomSettings = { duration: 10, workPerMinute: 1, restCalculated: true };
  rftSettings = { rounds: 5, exercises: [] as WorkoutVideo[] };
  chipperSettings = { exercises: [] as WorkoutVideo[], totalReps: 0 };
  ladderSettings = { type: 'ascending', startReps: 1, endReps: 10 };

  // 📝 Pre-Built Templates
  templates: WorkoutTemplate[] = [];
  selectedTemplate: WorkoutTemplate | null = null;
  templateCategories = ['AMRAP', 'EMOM', 'Strength', 'Cardio', 'Hybrid'];
  
  // 📚 Video Category System
  videoCategories = ['All', 'Workout/Exercise', 'Nutrition', 'Mindset/Spirit', 'Marketing', 'Push Notification'];
  selectedCategory = 'All';
  
  // 🔍 Enhanced Search & Filtering
  searchQuery = '';
  selectedDifficulty = 'All';
  selectedEquipment = 'All';
  selectedBodyPart = 'All';
  savedSearches: any[] = [];
  
  // 📅 Weekly Plan Builder
  weeklyPlans: WeeklyPlan[] = [];
  currentPlan: WeeklyPlan | null = null;
  planCalendar: { [day: string]: WorkoutTemplate[] } = {
    'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 
    'Friday': [], 'Saturday': [], 'Sunday': []
  };
  
  // 🚀 Streamlined Workflow
  quickTemplates: WorkoutTemplate[] = [];
  recentWorkouts: WorkoutTemplate[] = [];
  clientFavorites: { [clientId: string]: WorkoutTemplate[] } = {};
  
  // UI State
  viewMode: 'builder' | 'templates' | 'weekly-plan' | 'analytics' = 'builder';
  builderMode: 'drag-drop' | 'list' | 'grid' = 'drag-drop';
  showPreview = true;
  
  // Action History for Undo/Redo
  actionHistory: any[] = [];
  currentHistoryIndex = -1;
  maxHistorySize = 50;
  
  // 📊 Analytics & Insights
  workoutStats = {
    totalCreated: 0,
    avgBuildTime: 0,
    mostUsedExercises: [] as string[],
    completionRates: {} as { [key: string]: number },
    popularTemplates: [] as string[]
  };

  private subscriptions: Subscription[] = [];

  constructor(public dataService: DataService, public stats: StatsService) {
    if (!this.dataService?.workoutsList?.workouts?.length) {
      this.getFreshData();
    }
    this.initializeEnhancedFeatures();
  }

  ngOnInit(): void {
    this.loadVideoLibrary();
    this.loadTemplates();
    this.loadWeeklyPlans();
    this.initializeActionHistory();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.filterApplied) {
      this.getFreshData();
    }
  }

  // 🏗️ Initialize Enhanced Features
  initializeEnhancedFeatures(): void {
    this.loadS3VideoLibrary();
    this.setupAWSTranscription();
    this.loadQuickTemplates();
    this.loadRecentWorkouts();
    this.loadAnalytics();
  }

  // 🎨 Enhanced Workout Builder UX Methods
  
  // Drag & Drop Interface (Simplified implementation)
  onVideoDrop(fromIndex: number, toIndex: number, fromLibrary: boolean = false): void {
    if (fromLibrary) {
      // Add from library to workout
      const video = this.filteredVideos[fromIndex];
      this.addAction('add_video', { video, index: toIndex });
      this.currentWorkout.splice(toIndex, 0, video);
    } else {
      // Reorder within workout
      this.addAction('reorder', { 
        from: fromIndex, 
        to: toIndex,
        workout: [...this.currentWorkout]
      });
      // Simple array reorder
      const item = this.currentWorkout.splice(fromIndex, 1)[0];
      this.currentWorkout.splice(toIndex, 0, item);
    }
    this.updateWorkoutPreview();
  }

  // Helper method to move array items
  moveItemInArray(array: any[], fromIndex: number, toIndex: number): void {
    const item = array.splice(fromIndex, 1)[0];
    array.splice(toIndex, 0, item);
  }

  // Multi-Select Videos
  toggleVideoSelection(videoId: string): void {
    if (this.selectedVideos.has(videoId)) {
      this.selectedVideos.delete(videoId);
    } else {
      this.selectedVideos.add(videoId);
    }
  }

  selectAllVisible(): void {
    this.filteredVideos.forEach(video => this.selectedVideos.add(video.id));
  }

  clearSelection(): void {
    this.selectedVideos.clear();
  }

  addSelectedToWorkout(): void {
    const videosToAdd = this.videoLibrary.filter(video => this.selectedVideos.has(video.id));
    this.addAction('bulk_add', { videos: videosToAdd });
    this.currentWorkout.push(...videosToAdd);
    this.selectedVideos.clear();
    this.updateWorkoutPreview();
  }

  // Quick Actions
  duplicateExercise(index: number): void {
    const exercise = { ...this.currentWorkout[index] };
    exercise.id = exercise.id + '_copy_' + Date.now();
    this.addAction('duplicate', { exercise, index });
    this.currentWorkout.splice(index + 1, 0, exercise);
    this.updateWorkoutPreview();
  }

  removeExercise(index: number): void {
    const exercise = this.currentWorkout[index];
    this.addAction('remove', { exercise, index });
    this.currentWorkout.splice(index, 1);
    this.updateWorkoutPreview();
  }

  // Smart Suggestions
  getSuggestedVideos(): WorkoutVideo[] {
    if (this.currentWorkout.length === 0) return this.videoLibrary.slice(0, 6);
    
    const currentEquipment = new Set(this.currentWorkout.map(v => v.equipment));
    const currentBodyParts = new Set(this.currentWorkout.flatMap(v => v.bodyParts || []));
    
    return this.videoLibrary.filter(video => 
      !this.currentWorkout.some(w => w.id === video.id) &&
      (currentEquipment.has(video.equipment) || 
       video.bodyParts?.some(part => currentBodyParts.has(part)))
    ).slice(0, 6);
  }

  // Real-time Preview
  updateWorkoutPreview(): void {
    // Update preview calculations
  }

  getTotalWorkoutTime(): string {
    const totalSeconds = this.currentWorkout.reduce((total, video) => {
      const [minutes, seconds] = video.duration.split(':').map(Number);
      return total + (minutes * 60) + seconds;
    }, 0);
    
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getWorkoutEquipment(): string[] {
    return [...new Set(this.currentWorkout.map(v => v.equipment))];
  }

  // Undo/Redo System
  initializeActionHistory(): void {
    this.actionHistory = [];
    this.currentHistoryIndex = -1;
  }

  addAction(type: string, data: any): void {
    this.actionHistory = this.actionHistory.slice(0, this.currentHistoryIndex + 1);
    this.actionHistory.push({ type, data, timestamp: new Date() });
    this.currentHistoryIndex++;
    
    if (this.actionHistory.length > this.maxHistorySize) {
      this.actionHistory.shift();
      this.currentHistoryIndex--;
    }
  }

  undo(): void {
    if (this.currentHistoryIndex >= 0) {
      const action = this.actionHistory[this.currentHistoryIndex];
      this.revertAction(action);
      this.currentHistoryIndex--;
    }
  }

  redo(): void {
    if (this.currentHistoryIndex < this.actionHistory.length - 1) {
      this.currentHistoryIndex++;
      const action = this.actionHistory[this.currentHistoryIndex];
      this.applyAction(action);
    }
  }

  private revertAction(action: any): void {
    switch (action.type) {
      case 'add_video':
        this.currentWorkout.splice(action.data.index, 1);
        break;
      case 'bulk_add':
        this.currentWorkout = this.currentWorkout.filter(
          video => !action.data.videos.some((v: WorkoutVideo) => v.id === video.id)
        );
        break;
      case 'reorder':
        this.currentWorkout = [...action.data.workout];
        break;
    }
    this.updateWorkoutPreview();
  }

  private applyAction(action: any): void {
    switch (action.type) {
      case 'add_video':
        this.currentWorkout.splice(action.data.index, 0, action.data.video);
        break;
      case 'bulk_add':
        this.currentWorkout.push(...action.data.videos);
        break;
    }
    this.updateWorkoutPreview();
  }

  // ⏱️ Advanced Workout Types

  // AMRAP Builder
  createAMRAPWorkout(): void {
    this.workoutType = 'AMRAP';
    this.amrapSettings = { duration: 15, exercises: [...this.currentWorkout] };
  }

  calculateAMRAPRounds(): number {
    if (this.amrapSettings.exercises.length === 0) return 0;
    const totalExerciseTime = this.amrapSettings.exercises.reduce((total, ex) => {
      const [min, sec] = ex.duration.split(':').map(Number);
      return total + (min * 60) + sec;
    }, 0);
    return Math.floor((this.amrapSettings.duration * 60) / totalExerciseTime);
  }

  // EMOM Builder
  createEMOMWorkout(): void {
    this.workoutType = 'EMOM';
    this.emomSettings = { duration: 10, workPerMinute: 1, restCalculated: true };
  }

  calculateEMOMRest(): number {
    if (this.currentWorkout.length === 0) return 60;
    const workTime = this.currentWorkout.reduce((total, ex) => {
      const [min, sec] = ex.duration.split(':').map(Number);
      return total + sec + (min * 60);
    }, 0) / this.emomSettings.workPerMinute;
    return Math.max(0, 60 - workTime);
  }

  // RFT (Rounds for Time) Builder
  createRFTWorkout(): void {
    this.workoutType = 'RFT';
    this.rftSettings = { rounds: 5, exercises: [...this.currentWorkout] };
  }

  // Chipper Workouts
  createChipperWorkout(): void {
    this.workoutType = 'Chipper';
    this.chipperSettings = { exercises: [...this.currentWorkout], totalReps: 0 };
  }

  // Ladder Workouts
  createLadderWorkout(): void {
    this.workoutType = 'Ladder';
    this.ladderSettings = { type: 'ascending', startReps: 1, endReps: 10 };
  }

  // 📝 Pre-Built Workout Templates
  loadTemplates(): void {
    this.templates = [
      {
        id: 'amrap-15-bodyweight',
        name: '15 Min AMRAP - Bodyweight',
        type: 'AMRAP',
        duration: 15,
        exercises: [],
        difficulty: 'Intermediate',
        equipment: ['None'],
        tags: ['cardio', 'bodyweight', 'endurance'],
        description: 'High-intensity bodyweight AMRAP'
      },
      {
        id: 'emom-10-strength',
        name: '10 Min EMOM - Strength',
        type: 'EMOM',
        duration: 10,
        exercises: [],
        difficulty: 'Advanced',
        equipment: ['Barbell', 'Dumbbells'],
        tags: ['strength', 'power'],
        description: 'Strength-focused EMOM workout'
      },
      {
        id: 'traditional-upper-body',
        name: 'Upper Body Strength Circuit',
        type: 'Traditional',
        rounds: 4,
        exercises: [],
        difficulty: 'Intermediate',
        equipment: ['Dumbbells'],
        tags: ['strength', 'upper-body'],
        description: 'Traditional upper body strength training'
      }
    ];
  }

  applyTemplate(template: WorkoutTemplate): void {
    this.addAction('apply_template', { 
      previousWorkout: [...this.currentWorkout],
      template 
    });
    this.selectedTemplate = template;
    this.workoutType = template.type;
    this.workoutName = template.name;
    this.currentWorkout = [...template.exercises];
    this.updateWorkoutPreview();
  }

  saveAsTemplate(): void {
    const template: WorkoutTemplate = {
      id: 'custom_' + Date.now(),
      name: this.workoutName || 'Custom Template',
      type: this.workoutType,
      exercises: [...this.currentWorkout],
      difficulty: 'Intermediate',
      equipment: this.getWorkoutEquipment(),
      tags: [],
      createdBy: 'current_coach', // Replace with actual coach ID
      isPublic: false
    };
    
    this.templates.push(template);
    console.log('Template saved:', template);
  }

  // 📚 Video Category System
  loadVideoLibrary(): void {
    // Enhanced video library with 5 categories
    this.videoLibrary = [
      // Workout/Exercise Videos
      {
        id: 'burpees-1',
        name: 'Burpees',
        url: 'https://bodyf1rst-workout-video-storage.s3.us-east-1.amazonaws.com/burpees%20(360p).mp4',
        duration: '1:30',
        category: 'Workout/Exercise',
        equipment: 'None',
        difficulty: 'Advanced',
        tags: ['cardio', 'full-body', 'high-intensity'],
        bodyParts: ['full-body'],
        transcription: 'Stand tall, squat down, jump back to plank, do push-up, jump forward, jump up',
        autoTags: ['explosive', 'conditioning', 'bodyweight']
      },
      {
        id: 'squats-1',
        name: 'Squats',
        url: 'https://bodyf1rst-workout-video-storage.s3.us-east-1.amazonaws.com/squats%20(360p).mp4',
        duration: '2:30',
        category: 'Workout/Exercise',
        equipment: 'None',
        difficulty: 'Beginner',
        tags: ['legs', 'strength', 'compound'],
        bodyParts: ['legs', 'glutes'],
        transcription: 'Feet shoulder width apart, sit back, keep chest up, drive through heels',
        autoTags: ['fundamental', 'lower-body', 'functional']
      },
      // Nutrition Videos
      {
        id: 'meal-prep-1',
        name: 'Weekly Meal Prep Guide',
        url: 'https://bodyf1rst-workout-video-storage.s3.us-east-1.amazonaws.com/meal-prep.mp4',
        duration: '5:00',
        category: 'Nutrition',
        equipment: 'None',
        difficulty: 'Beginner',
        tags: ['meal-prep', 'nutrition', 'planning'],
        bodyParts: [],
        transcription: 'Plan your meals, prep proteins, portion vegetables, store properly',
        autoTags: ['education', 'lifestyle', 'planning']
      },
      // Mindset/Spirit Videos
      {
        id: 'motivation-1',
        name: 'Morning Motivation',
        url: 'https://bodyf1rst-workout-video-storage.s3.us-east-1.amazonaws.com/motivation.mp4',
        duration: '3:00',
        category: 'Mindset/Spirit',
        equipment: 'None',
        difficulty: 'Beginner',
        tags: ['motivation', 'mindset', 'morning'],
        bodyParts: [],
        transcription: 'Start your day with intention, set goals, believe in yourself',
        autoTags: ['inspiration', 'mental-health', 'positivity']
      }
    ];
    this.filteredVideos = [...this.videoLibrary];
  }

  // 🏗️ AWS Transcription Pipeline
  loadS3VideoLibrary(): void {
    // Connect to actual S3 bucket and load videos
    console.log('Loading S3 video library...');
  }

  setupAWSTranscription(): void {
    // Setup AWS Transcribe integration
    console.log('Setting up AWS Transcription pipeline...');
  }

  transcribeVideo(videoId: string): void {
    // Trigger AWS Transcribe job
    console.log('Starting transcription for video:', videoId);
  }

  extractWorkoutTags(transcription: string): string[] {
    // AI-powered tag extraction from transcription
    const workoutKeywords = ['chest', 'legs', 'arms', 'core', 'cardio', 'strength', 'dumbbells', 'barbell', 'squats', 'push-ups'];
    return workoutKeywords.filter(keyword => 
      transcription.toLowerCase().includes(keyword)
    );
  }

  // 🔍 Enhanced Search & Filtering
  applyFilters(): void {
    let filtered = [...this.videoLibrary];

    // Search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(video => 
        video.name.toLowerCase().includes(query) ||
        video.equipment.toLowerCase().includes(query) ||
        video.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        video.bodyParts?.some(part => part.toLowerCase().includes(query)) ||
        video.transcription?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(video => video.category === this.selectedCategory);
    }

    // Difficulty filter
    if (this.selectedDifficulty !== 'All') {
      filtered = filtered.filter(video => video.difficulty === this.selectedDifficulty);
    }

    // Equipment filter
    if (this.selectedEquipment !== 'All') {
      filtered = filtered.filter(video => video.equipment === this.selectedEquipment);
    }

    this.filteredVideos = filtered;
  }

  saveSearch(): void {
    const search = {
      name: `Search ${this.savedSearches.length + 1}`,
      query: this.searchQuery,
      category: this.selectedCategory,
      difficulty: this.selectedDifficulty,
      equipment: this.selectedEquipment,
      timestamp: new Date()
    };
    this.savedSearches.push(search);
  }

  loadSavedSearch(search: any): void {
    this.searchQuery = search.query;
    this.selectedCategory = search.category;
    this.selectedDifficulty = search.difficulty;
    this.selectedEquipment = search.equipment;
    this.applyFilters();
  }

  // 📅 Weekly Plan Builder
  loadWeeklyPlans(): void {
    this.weeklyPlans = [];
  }

  createWeeklyPlan(): void {
    const plan: WeeklyPlan = {
      id: 'plan_' + Date.now(),
      name: 'New Weekly Plan',
      startDate: new Date(),
      workouts: { ...this.planCalendar },
      coachId: 'current_coach', // Replace with actual coach ID
      notes: ''
    };
    this.weeklyPlans.push(plan);
    this.currentPlan = plan;
  }

  addWorkoutToPlan(day: string, workout: WorkoutTemplate): void {
    if (!this.planCalendar[day]) {
      this.planCalendar[day] = [];
    }
    this.planCalendar[day].push(workout);
  }

  // 🚀 Streamlined Coach Workflow
  loadQuickTemplates(): void {
    this.quickTemplates = this.templates.slice(0, 5); // Most used templates
  }

  loadRecentWorkouts(): void {
    this.recentWorkouts = []; // Load from localStorage or API
  }

  quickCreateWorkout(templateId: string): void {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      this.applyTemplate(template);
      this.viewMode = 'builder';
    }
  }

  // 📊 Analytics & Insights
  loadAnalytics(): void {
    this.workoutStats = {
      totalCreated: 150,
      avgBuildTime: 3.5, // minutes
      mostUsedExercises: ['Burpees', 'Squats', 'Push-ups'],
      completionRates: { 'AMRAP': 85, 'EMOM': 78, 'Traditional': 92 },
      popularTemplates: ['15 Min AMRAP', 'Upper Body Circuit', 'HIIT Cardio']
    };
  }

  // Save Workout
  saveWorkout(): void {
    const workout = {
      name: this.workoutName,
      type: this.workoutType,
      exercises: this.currentWorkout,
      totalTime: this.getTotalWorkoutTime(),
      equipment: this.getWorkoutEquipment(),
      createdAt: new Date(),
      coachId: 'current_coach' // Replace with actual coach ID
    };
    
    console.log('Saving workout:', workout);
    // Implement actual save logic to backend
    this.recentWorkouts.unshift(workout as any);
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getWorkoutsApi, 'workouts', 'workoutsList')
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.workoutsList.fieldText?.length) {
      ['status', 'uploaded_by', 'coach_id', 'visibility_type'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getWorkoutsApi,
      'workouts',
      'workoutsList',
      this.dataService.stats.workoutsList.fieldText, filterQuery
    ).then(() => {

      document.getElementById('closeFilter')?.click();
    });
  }

  clearSearch() {
    this.getFreshData()
    this.dataService.stats.workoutsList.fieldText = null;
    this.dataService.stats.workoutsList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
    this.dataService.stats.workoutsList.fieldText = null
  }

  getCoaches() {
    if (this.pageFilter.organization_id) {
      const selectedOrganization = this.dataService.organizationsDropdown.find(
        (o: any) => o.id === Number(this.pageFilter.organization_id)
      );
      return [selectedOrganization?.coach] || [];
    } else {
      return this.dataService.coachesDropdown;
    }
  }

}
