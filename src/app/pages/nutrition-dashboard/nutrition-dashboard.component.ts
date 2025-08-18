import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-nutrition-dashboard',
  templateUrl: './nutrition-dashboard.component.html',
  styleUrls: ['./nutrition-dashboard.component.scss']
})
export class NutritionDashboardComponent implements OnInit {
  
  // Component state
  isLoading = true;
  isSyncing = false;
  showGoalsModal = false;
  chartView = 'calories';
  currentDate = new Date();
  
  // Health sync status
  healthSyncStatus = 'Sync Health';
  
  // Form for editing goals
  goalsForm: FormGroup;
  
  // Nutrition data structure matching mobile app
  nutritionData = {
    date: new Date().toISOString().split('T')[0],
    calories: {
      consumed: 1650,
      target: 2000,
      remaining: 350,
      percentage: 82.5
    },
    macros: {
      protein: {
        consumed: 120,
        target: 150,
        percentage: 80
      },
      carbs: {
        consumed: 180,
        target: 200,
        percentage: 90
      },
      fats: {
        consumed: 52,
        target: 65,
        percentage: 80
      }
    },
    body_points: {
      earned: 83,
      max: 100,
      percentage: 83,
      breakdown: {
        calories: 21,
        protein: 20,
        carbs: 22,
        fats: 20
      }
    },
    last_synced: new Date()
  };
  
  // Nutrition goals
  nutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65
  };

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder
  ) {
    this.initializeGoalsForm();
  }

  ngOnInit(): void {
    this.loadNutritionData();
    this.initializeChart();
  }

  /**
   * Initialize the goals editing form
   */
  initializeGoalsForm(): void {
    this.goalsForm = this.formBuilder.group({
      calories: [this.nutritionGoals.calories, [Validators.required, Validators.min(1000), Validators.max(5000)]],
      protein: [this.nutritionGoals.protein, [Validators.required, Validators.min(50), Validators.max(300)]],
      carbs: [this.nutritionGoals.carbs, [Validators.required, Validators.min(100), Validators.max(500)]],
      fats: [this.nutritionGoals.fats, [Validators.required, Validators.min(30), Validators.max(150)]]
    });
  }

  /**
   * Load nutrition data from API
   */
  async loadNutritionData(): Promise<void> {
    this.isLoading = true;
    
    try {
      // Call the new nutrition API endpoints
      const response = await this.dataService.getDailyNutrition(this.currentDate.toISOString().split('T')[0]);
      
      if (response && response.status === 200) {
        this.nutritionData = response.nutrition;
        this.calculatePercentages();
      } else {
        // Use mock data if API is not available
        console.log('Using mock nutrition data');
        this.calculatePercentages();
      }
      
      // Load nutrition goals
      await this.loadNutritionGoals();
      
    } catch (error) {
      console.error('Error loading nutrition data:', error);
      // Use mock data on error
      this.calculatePercentages();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load nutrition goals from API
   */
  async loadNutritionGoals(): Promise<void> {
    try {
      const response = await this.dataService.getNutritionGoals();
      
      if (response && response.status === 200) {
        this.nutritionGoals = response.goals;
        this.updateGoalsForm();
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
    }
  }

  /**
   * Calculate percentages for nutrition data
   */
  calculatePercentages(): void {
    // Calculate calorie percentage
    this.nutritionData.calories.percentage = this.nutritionData.calories.target > 0 
      ? Math.min(100, (this.nutritionData.calories.consumed / this.nutritionData.calories.target) * 100) 
      : 0;
    
    this.nutritionData.calories.remaining = Math.max(0, 
      this.nutritionData.calories.target - this.nutritionData.calories.consumed
    );

    // Calculate macro percentages
    this.nutritionData.macros.protein.percentage = this.nutritionData.macros.protein.target > 0 
      ? Math.min(100, (this.nutritionData.macros.protein.consumed / this.nutritionData.macros.protein.target) * 100) 
      : 0;
    
    this.nutritionData.macros.carbs.percentage = this.nutritionData.macros.carbs.target > 0 
      ? Math.min(100, (this.nutritionData.macros.carbs.consumed / this.nutritionData.macros.carbs.target) * 100) 
      : 0;
    
    this.nutritionData.macros.fats.percentage = this.nutritionData.macros.fats.target > 0 
      ? Math.min(100, (this.nutritionData.macros.fats.consumed / this.nutritionData.macros.fats.target) * 100) 
      : 0;

    // Calculate body points
    this.calculateBodyPoints();
  }

  /**
   * Calculate body points based on nutrition completion
   */
  calculateBodyPoints(): void {
    const averageCompletion = (
      this.nutritionData.calories.percentage + 
      this.nutritionData.macros.protein.percentage + 
      this.nutritionData.macros.carbs.percentage + 
      this.nutritionData.macros.fats.percentage
    ) / 4;

    this.nutritionData.body_points.percentage = Math.round(averageCompletion);
    this.nutritionData.body_points.earned = Math.round((averageCompletion / 100) * this.nutritionData.body_points.max);

    // Calculate breakdown
    const pointsPerCategory = this.nutritionData.body_points.max / 4;
    this.nutritionData.body_points.breakdown = {
      calories: Math.round((this.nutritionData.calories.percentage / 100) * pointsPerCategory),
      protein: Math.round((this.nutritionData.macros.protein.percentage / 100) * pointsPerCategory),
      carbs: Math.round((this.nutritionData.macros.carbs.percentage / 100) * pointsPerCategory),
      fats: Math.round((this.nutritionData.macros.fats.percentage / 100) * pointsPerCategory)
    };
  }

  /**
   * Sync health app data
   */
  async syncHealthData(): Promise<void> {
    this.isSyncing = true;
    this.healthSyncStatus = 'Syncing...';
    
    try {
      // Call health app sync API
      const response = await this.dataService.syncHealthAppData({
        date: this.currentDate.toISOString().split('T')[0],
        source: 'web_manual',
        calories: this.nutritionData.calories.consumed,
        protein: this.nutritionData.macros.protein.consumed,
        carbs: this.nutritionData.macros.carbs.consumed,
        fats: this.nutritionData.macros.fats.consumed
      });
      
      if (response && response.status === 200) {
        this.healthSyncStatus = 'Synced';
        this.nutritionData.last_synced = new Date();
        
        // Reload data after sync
        await this.loadNutritionData();
      } else {
        this.healthSyncStatus = 'Sync Failed';
      }
    } catch (error) {
      console.error('Error syncing health data:', error);
      this.healthSyncStatus = 'Sync Failed';
    } finally {
      this.isSyncing = false;
      
      // Reset sync status after 3 seconds
      setTimeout(() => {
        this.healthSyncStatus = 'Sync Health';
      }, 3000);
    }
  }

  /**
   * Open goals editing modal
   */
  editGoals(): void {
    this.updateGoalsForm();
    this.showGoalsModal = true;
  }

  /**
   * Close goals editing modal
   */
  closeGoalsModal(): void {
    this.showGoalsModal = false;
  }

  /**
   * Update goals form with current values
   */
  updateGoalsForm(): void {
    this.goalsForm.patchValue(this.nutritionGoals);
  }

  /**
   * Save nutrition goals
   */
  async saveGoals(): Promise<void> {
    if (this.goalsForm.valid) {
      const newGoals = this.goalsForm.value;
      
      try {
        const response = await this.dataService.updateNutritionGoals(newGoals);
        
        if (response && response.status === 200) {
          this.nutritionGoals = newGoals;
          this.closeGoalsModal();
          
          // Update targets in nutrition data
          this.nutritionData.calories.target = newGoals.calories;
          this.nutritionData.macros.protein.target = newGoals.protein;
          this.nutritionData.macros.carbs.target = newGoals.carbs;
          this.nutritionData.macros.fats.target = newGoals.fats;
          
          // Recalculate percentages
          this.calculatePercentages();
          
          // Show success message
          this.dataService.showToast('Nutrition goals updated successfully!', 'success');
        } else {
          this.dataService.showToast('Failed to update nutrition goals', 'error');
        }
      } catch (error) {
        console.error('Error saving nutrition goals:', error);
        this.dataService.showToast('Error updating nutrition goals', 'error');
      }
    }
  }

  /**
   * Initialize nutrition chart
   */
  initializeChart(): void {
    // Chart initialization will be implemented with Chart.js
    // For now, this is a placeholder
    console.log('Chart initialization placeholder');
  }

  /**
   * Update nutrition intake (for manual entry)
   */
  async updateNutritionIntake(data: any): Promise<void> {
    try {
      const response = await this.dataService.updateNutritionIntake({
        date: this.currentDate.toISOString().split('T')[0],
        ...data
      });
      
      if (response && response.status === 200) {
        await this.loadNutritionData();
        this.dataService.showToast('Nutrition intake updated successfully!', 'success');
      } else {
        this.dataService.showToast('Failed to update nutrition intake', 'error');
      }
    } catch (error) {
      console.error('Error updating nutrition intake:', error);
      this.dataService.showToast('Error updating nutrition intake', 'error');
    }
  }

  /**
   * Get nutrition history for charts
   */
  async getNutritionHistory(days: number = 7): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    try {
      const response = await this.dataService.getNutritionHistory(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      if (response && response.status === 200) {
        return response.history;
      }
    } catch (error) {
      console.error('Error loading nutrition history:', error);
    }
    
    return [];
  }
}
