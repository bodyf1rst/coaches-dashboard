import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss']
})
export class LeftSidebarComponent implements OnInit {

  // 🎨 Enhanced Menu with Colorful Emojis
  menuItems = [
    { route: '/dashboard', label: 'Dashboard', emoji: '🏠', color: '#FF6B6B' },
    { route: '/manage-coaches', label: 'Manage Coaches', emoji: '👨‍🏫', color: '#4ECDC4' },
    { route: '/manage-users', label: 'Manage Users', emoji: '👥', color: '#45B7D1' },
    { route: '/manage-organizations', label: 'Manage Organizations', emoji: '🏢', color: '#96CEB4', hasDropdown: true },
    
    // Video & Content Section
    { route: '/video-libraries', label: 'Video Libraries', emoji: '📹', color: '#DDA0DD', hasDropdown: true,
      subItems: [
        { route: '/workout-videos', label: 'Workout Videos', emoji: '💪' },
        { route: '/nutrition-videos', label: 'Nutrition Videos', emoji: '🥗' },
        { route: '/mindset-videos', label: 'Mindset Videos', emoji: '🧘' },
        { route: '/marketing-videos', label: 'Marketing Videos', emoji: '📢' },
        { route: '/push-notifications', label: 'Push Notifications', emoji: '🔔' }
      ]
    },
    
    // Fitness & Workout Section
    { route: '/manage-fitness', label: 'Manage Fitness', emoji: '🏋️', color: '#FFB6C1', hasDropdown: true,
      subItems: [
        { route: '/workout-builder', label: 'Workout Builder', emoji: '🎯' },
        { route: '/amrap-builder', label: 'AMRAP Builder', emoji: '⏱️' },
        { route: '/emom-builder', label: 'EMOM Builder', emoji: '⏲️' },
        { route: '/templates', label: 'Templates', emoji: '📋' },
        { route: '/weekly-plans', label: 'Weekly Plans', emoji: '📅' }
      ]
    },
    
    { route: '/manage-challenges', label: 'Manage Challenges', emoji: '🏆', color: '#FFD93D', hasDropdown: true,
      subItems: [
        { route: '/all-challenges', label: 'All Challenges', emoji: '🎯' },
        { route: '/add-challenge', label: 'Add Challenge', emoji: '➕' }
      ]
    },
    
    // Nutrition Section
    { route: '/manage-nutrition', label: 'Manage Nutrition', emoji: '🍎', color: '#6BCF7F', hasDropdown: true },
    
    // Analytics & Insights
    { route: '/client-dashboard', label: 'Client Dashboard', emoji: '📊', color: '#B19CD9' },
    { route: '/analytics', label: 'Analytics & Insights', emoji: '📈', color: '#FF9F40' },
    { route: '/coach-workflow', label: 'Coach Workflow', emoji: '🚀', color: '#66D9EF' },
    
    // Points & Rewards
    { route: '/manage-bodypoints', label: 'Manage BodyPoints', emoji: '🎖️', color: '#FFB347' },
    
    // Content & Communication
    { route: '/manage-announcements', label: 'Manage Announcements', emoji: '📣', color: '#87CEEB' },
    { route: '/manage-content', label: 'Manage Content', emoji: '📝', color: '#DDA0DD' },
    
    // Profile & Settings
    { route: '/my-profile', label: 'My Profile', emoji: '👤', color: '#98D8C8' },
    { route: '/logout', label: 'Logout', emoji: '🚪', color: '#F06292' }
  ];

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
    this.initializeMenu();
  }

  initializeMenu(): void {
    // Initialize menu with colorful emojis
    console.log('Enhanced menu with emojis loaded');
  }


  isDropdownActive(rla: any): boolean {
    return rla.isActive;
  }

  // This funciton will toggle class into main area to mange menu.
  menuClick(action: boolean) {
    this.dataService.isMenuOpen = action;
    var mainArea: any = document.getElementsByClassName('main-dashboard-area');
    if (action) {
      mainArea[0].classList.add('menu-open')
    } else {
      mainArea[0].classList.remove('menu-open')
    }
  }
}
