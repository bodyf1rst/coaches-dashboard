import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public statsList: any = []
  constructor(public dataService: DataService) {
    // Set up mock super admin user context for testing
    this.dataService.currentUserData = {
      id: 1,
      first_name: 'Super',
      last_name: 'User',
      name: 'Super User',
      email: 'superadmin@bodyf1rst.com',
      role: 'Admin',
      is_super_admin: true,
      organization_id: 1,
      profile_image: null
    };
    this.dataService.isAdminUser = true;
    this.dataService.userFetchedSubject.next(true);
    
    // Use mock data for testing - bypass API calls
    const mockStats = {
      status: "200",
      total_organizations: 5,
      new_submissions: 12,
      total_employees: 150,
      total_users: 89,
      total_coaches: 8,
      total_challenges: 25,
      total_videos: 45,
      total_exercises: 120,
      total_workouts: 35,
      total_plans: 18
    };
    this.dataService.dashboardStats = mockStats;
    this.initializeStats(mockStats);
  }

  ngOnInit(): void {
    // Skip API subscriptions for testing - using mock data
    console.log('Dashboard loaded with mock data for testing');
  }

  initializeStats(stats: any) {
    this.statsList = [
      {
        title: 'Total Organizations',
        value: stats.total_organizations,
        icon: '../../../assets/images/manage-organization.svg',
        link: '/manage-organizations'
      },
      {
        title: 'New Submitions',
        value: stats.new_submissions,
        icon: '../../../assets/images/manage-organization.svg',
        link: '/organization-submitions'
      },
      {
        title: 'Total Employees',
        value: stats.total_employees,
        icon: '../../../assets/images/user-icon.svg',
        link: '/employees'
      },
      {
        title: 'Total Clients',
        value: stats.total_users,
        icon: '../../../assets/images/user-icon.svg',
        link: '/clients'
      },
      {
        title: 'Total Coaches',
        value: stats.total_coaches,
        icon: '../../../assets/images/coach.svg',
        link: '/coaches'
      },
      {
        title: 'Total Videos',
        value: stats.total_videos,
        icon: '../../../assets/images/play-icon.svg',
        link: '/manage-videos'
      },
      {
        title: 'Total Exercises',
        value: stats.total_exercises,
        icon: '../../../assets/images/gym-icon.svg',
        link: '/manage-exercises'
      },
      {
        title: 'Total Workouts',
        value: stats.total_workouts,
        icon: '../../../assets/images/gym-icon.svg',
        link: '/manage-workouts'
      },
      {
        title: 'Total Plans',
        value: stats.total_plans,
        icon: '../../../assets/images/plan-icon.svg',
        link: '/plans'
      },
      {
        title: 'Total Challenges',
        value: stats.total_challenges,
        icon: '../../../assets/images/goal-icon.svg',
        link: '/manage-challenges'
      },

    ]
    this.statsList = this.statsList.filter((item: any) => item.value != null);
  }
}
