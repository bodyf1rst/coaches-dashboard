import { Component, OnInit } from '@angular/core';
import { DataService } from '../../service/data.service';

export interface LeaderboardUser {
  id: number;
  first_name: string;
  last_name: string;
  body_points: number;
  profile_image_thumbnail?: string;
  department?: string;
  rank: number;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  leaderboardUsers: LeaderboardUser[] = [];
  isLoading: boolean = true;
  error: string = '';
  selectedOrganization: any = null;
  organizations: any[] = [];
  maxUsers: number = 50;

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.dataService.getOrganizations().then((response: any) => {
      if (response && response.status === 200) {
        this.organizations = response.data || [];
        if (this.organizations.length > 0) {
          this.selectedOrganization = this.organizations[0];
          this.loadLeaderboard();
        }
      }
    }).catch((error: any) => {
      console.error('Error loading organizations:', error);
      this.error = 'Failed to load organizations';
      this.isLoading = false;
    });
  }

  loadLeaderboard() {
    if (!this.selectedOrganization) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const formData = new FormData();
    formData.append('organization_id', this.selectedOrganization.id.toString());
    formData.append('limit', this.maxUsers.toString());

    this.dataService.getLeaderboard(formData).then((response: any) => {
      if (response && response.success && response.data) {
        this.leaderboardUsers = response.data.map((user: any, index: number) => ({
          ...user,
          rank: index + 1,
          body_points: Number(user.body_points) || 0
        }));
      } else {
        this.leaderboardUsers = [];
      }
      this.isLoading = false;
    }).catch((error: any) => {
      console.error('Error loading leaderboard:', error);
      this.error = 'Failed to load leaderboard data';
      this.isLoading = false;
    });
  }

  onOrganizationChange() {
    this.loadLeaderboard();
  }

  refreshLeaderboard() {
    this.loadLeaderboard();
  }

  getRankIcon(rank: number): string {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }

  formatPoints(points: number): string {
    if (points >= 1000000) {
      return (points / 1000000).toFixed(1) + 'M';
    } else if (points >= 1000) {
      return (points / 1000).toFixed(1) + 'K';
    }
    return points.toString();
  }

  getProfileImage(user: LeaderboardUser): string {
    return user.profile_image_thumbnail || './assets/images/default-thumbnail.jpg';
  }

  onImageError(event: any): void {
    if (event.target) {
      event.target.src = './assets/images/default-thumbnail.jpg';
    }
  }

  trackByUserId(index: number, user: LeaderboardUser): any {
    return user.id || index;
  }

  exportLeaderboard() {
    if (this.leaderboardUsers.length === 0) {
      return;
    }

    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leaderboard-${this.selectedOrganization?.name || 'data'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = ['Rank', 'Name', 'Department', 'Body Points'];
    const rows = this.leaderboardUsers.map(user => [
      user.rank,
      `${user.first_name} ${user.last_name}`,
      user.department || 'N/A',
      user.body_points
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
