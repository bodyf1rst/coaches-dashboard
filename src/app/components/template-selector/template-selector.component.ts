import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { WorkoutBuilderService } from '../../services/workout-builder.service';
import { WorkoutTemplate } from '../../models/workout-builder.model';

interface TemplateCategory {
  type: 'strength' | 'cardio' | 'hiit' | 'mobility' | 'recovery' | 'custom';
  name: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-template-selector',
  templateUrl: './template-selector.component.html',
  styleUrls: ['./template-selector.component.scss']
})
export class TemplateSelectorComponent implements OnInit {
  @Input() coachId: number = 1; // Default to coach 1
  @Output() templateSelected = new EventEmitter<WorkoutTemplate>();
  @Output() closeModal = new EventEmitter<void>();

  systemTemplates: WorkoutTemplate[] = [];
  customTemplates: WorkoutTemplate[] = [];
  filteredSystemTemplates: WorkoutTemplate[] = [];
  filteredCustomTemplates: WorkoutTemplate[] = [];

  activeTab: 'system' | 'custom' = 'system';
  selectedTemplate: WorkoutTemplate | null = null;

  showCreateModal = false;
  newTemplate = {
    name: '',
    type: 'custom' as const,
    description: '',
    coach_id: this.coachId
  };

  isLoading = false;
  error: string | null = null;
  filterType: string = 'all';

  templateCategories: TemplateCategory[] = [
    {
      type: 'strength',
      name: 'Strength Training',
      icon: '💪',
      color: '#e74c3c',
      description: 'Build muscle and increase power'
    },
    {
      type: 'cardio',
      name: 'Cardio',
      icon: '🏃',
      color: '#3498db',
      description: 'Improve cardiovascular endurance'
    },
    {
      type: 'hiit',
      name: 'HIIT',
      icon: '⚡',
      color: '#f39c12',
      description: 'High-intensity interval training'
    },
    {
      type: 'mobility',
      name: 'Mobility',
      icon: '🧘',
      color: '#9b59b6',
      description: 'Enhance flexibility and range of motion'
    },
    {
      type: 'recovery',
      name: 'Recovery',
      icon: '💆',
      color: '#1abc9c',
      description: 'Active recovery and stretching'
    },
    {
      type: 'custom',
      name: 'Custom',
      icon: '⚙️',
      color: '#95a5a6',
      description: 'Create your own workout type'
    }
  ];

  constructor(private workoutBuilderService: WorkoutBuilderService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.error = null;

    this.workoutBuilderService.getTemplates(this.coachId).subscribe({
      next: (response) => {
        if (response.success) {
          this.systemTemplates = response.templates.filter(t => t.is_system_template);
          this.customTemplates = response.templates.filter(t => !t.is_system_template);
          this.applyFilter();
        } else {
          this.error = 'Failed to load templates';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.error = 'Error loading templates. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.filterType === 'all') {
      this.filteredSystemTemplates = this.systemTemplates;
      this.filteredCustomTemplates = this.customTemplates;
    } else {
      this.filteredSystemTemplates = this.systemTemplates.filter(t => t.type === this.filterType);
      this.filteredCustomTemplates = this.customTemplates.filter(t => t.type === this.filterType);
    }
  }

  onFilterChange(type: string): void {
    this.filterType = type;
    this.applyFilter();
  }

  selectTemplate(template: WorkoutTemplate): void {
    this.selectedTemplate = template;
    this.templateSelected.emit(template);
  }

  getCategoryInfo(type: string): TemplateCategory | undefined {
    return this.templateCategories.find(cat => cat.type === type);
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newTemplate = {
      name: '',
      type: 'custom',
      description: '',
      coach_id: this.coachId
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createCustomTemplate(): void {
    if (!this.newTemplate.name.trim()) {
      this.error = 'Template name is required';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.workoutBuilderService.createTemplate(this.newTemplate).subscribe({
      next: (response) => {
        if (response.success) {
          this.customTemplates.push(response.template);
          this.applyFilter();
          this.closeCreateModal();
          this.selectTemplate(response.template);
        } else {
          this.error = 'Failed to create template';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating template:', err);
        this.error = 'Error creating template. Please try again.';
        this.isLoading = false;
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  switchTab(tab: 'system' | 'custom'): void {
    this.activeTab = tab;
  }
}
