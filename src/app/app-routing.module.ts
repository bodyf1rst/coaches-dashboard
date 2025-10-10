import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ManageOrganizationsComponent } from './pages/manage-organizations/manage-organizations.component';
import { AddOrganizationComponent } from './pages/manage-organizations/add-organization/add-organization.component';
import { ManageDepartmentsComponent } from './pages/manage-departments/manage-departments.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { AddClientComponent } from './pages/clients/add-client/add-client.component';
import { ManagePreferencesComponent } from './pages/manage-preferences/manage-preferences.component';
import { AuthGuard } from './guard/auth.guard';
import { ManageCoachesComponent } from './pages/manage-coaches/manage-coaches.component';
import { AddCoachComponent } from './pages/manage-coaches/add-coach/add-coach.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ManageVideosComponent } from './pages/manage-videos/manage-videos.component';
import { AddVideoComponent } from './pages/manage-videos/add-video/add-video.component';
import { ManageChallengesComponent } from './pages/manage-challenges/manage-challenges.component';
import { AddChallengeComponent } from './pages/manage-challenges/add-challenge/add-challenge.component';
import { ChallengeDetailComponent } from './pages/manage-challenges/challenge-detail/challenge-detail.component';
import { StopNavigateGuard } from './guard/stop-navigate.guard';
import { ManagePlansComponent } from './pages/manage-plans/manage-plans.component';
import { AddPlanComponent } from './pages/manage-plans/add-plan/add-plan.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CoachRestrictGuard } from './guard/coach-restrict.guard';
import { OrganizationsSubmitionsComponent } from './pages/manage-organizations/organizations-submitions/organizations-submitions.component';
import { OrganizationRequestFormComponent } from './pages/manage-organizations/organization-request-form/organization-request-form.component';
import { ManageNutritionsComponent } from './pages/manage-nutritions/manage-nutritions.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ManageBodyPointsComponent } from './pages/manage-body-points/manage-body-points.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { StaticContentComponent } from './pages/manage-content/static-content/static-content.component';
import { IntroVideosComponent } from './pages/manage-content/intro-videos/intro-videos.component';
import { AddIntroVideoComponent } from './pages/manage-content/intro-videos/add-intro-video/add-intro-video.component';
import { EmployeesComponent } from './pages/clients/employees/employees.component';
import { NutritionsVideosComponent } from './pages/manage-nutritions/nutritions-videos/nutritions-videos.component';
import { AddNutritionsVideosComponent } from './pages/manage-nutritions/add-nutritions-videos/add-nutritions-videos.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { VideoLibraryComponent } from './pages/video-library/video-library.component';
import { NutritionVideoTestComponent } from './pages/nutrition-video-test/nutrition-video-test.component';
import { FitnessHubComponent } from './pages/fitness-hub/fitness-hub.component';
import { FitnessVideosComponent } from './pages/fitness-videos/fitness-videos.component';
import { NutritionHubComponent } from './pages/nutrition-hub/nutrition-hub.component';
import { SpiritMindsetHubComponent } from './pages/spirit-mindset-hub/spirit-mindset-hub.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [StopNavigateGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [StopNavigateGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: 'manage-organizations',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ManageOrganizationsComponent,
      },
      {
        path: 'organization-detail/:id',
        component: AddOrganizationComponent
      },
    ]
  },
  { path: 'add-organization', component: AddOrganizationComponent, canActivate: [AuthGuard, CoachRestrictGuard] },
  { path: 'manage-departments-and-rewards', component: ManageDepartmentsComponent, canActivate: [AuthGuard] },
  {
    path: 'organization-submitions',
    canActivate: [AuthGuard, CoachRestrictGuard],
    children: [
      {
        path: '',
        component: OrganizationsSubmitionsComponent,
      },
      {
        path: 'organization-detail/:id',
        component: AddOrganizationComponent
      },
    ]
  },
  { path: 'submit-organization/:token', component: OrganizationRequestFormComponent },
  { path: 'employees', component: EmployeesComponent, canActivate: [AuthGuard] },
  {
    path: 'employees',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: EmployeesComponent,
      },
      {
        path: 'user-detail/:id',
        component: AddClientComponent
      }
    ]
  },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
  {
    path: 'clients',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ClientsComponent,
      },
      {
        path: 'user-detail/:id',
        component: AddClientComponent
      }
    ]
  },
  { path: 'add-user', component: AddClientComponent, canActivate: [AuthGuard] },
  { path: 'preferences', component: ManagePreferencesComponent, canActivate: [AuthGuard, CoachRestrictGuard] },
  {
    path: 'coaches',
    canActivate: [AuthGuard, CoachRestrictGuard],
    children: [
      {
        path: '',
        component: ManageCoachesComponent,
      },
      {
        path: 'coach-detail/:id',
        component: AddCoachComponent
      }
    ]
  },

  { path: 'add-coach', component: AddCoachComponent, canActivate: [AuthGuard, CoachRestrictGuard] },
  { path: 'my-profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'manage-videos',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ManageVideosComponent,
      },
      {
        path: 'video-detail/:id',
        component: AddVideoComponent
      },
    ]
  },
  { path: 'add-video', component: AddVideoComponent, canActivate: [AuthGuard] },
  {
    path: 'manage-challenges',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ManageChallengesComponent,
      },
      {
        path: 'challenge-detail/:id',
        component: ChallengeDetailComponent
      },
      {
        path: 'edit-challenge/:id',
        component: AddChallengeComponent
      },
    ]
  },
  { path: 'add-challenge', component: AddChallengeComponent, canActivate: [AuthGuard] },
  {
    path: 'plans',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ManagePlansComponent,
      },
      {
        path: 'plan-detail/:id',
        component: AddPlanComponent
      },
      {
        path: 'add-plan',
        component: AddPlanComponent
      },
    ]
  },
  { path: 'nutrition-formula', component: ManageNutritionsComponent, canActivate: [AuthGuard, CoachRestrictGuard] },
  {
    path: 'nutrition-videos',
    canActivate: [AuthGuard, CoachRestrictGuard],
    children: [
      {
        path: '',
        component: NutritionsVideosComponent,
      },
      {
        path: 'nutrition-video-detail/:id',
        component: AddNutritionsVideosComponent
      },
    ]
  },
  { path: 'add-nutrition-video', component: AddNutritionsVideosComponent, canActivate: [AuthGuard, CoachRestrictGuard] },
  { path: 'messages', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'manage-body-points', component: ManageBodyPointsComponent, canActivate: [AuthGuard, CoachRestrictGuard] },
  { path: 'manage-notifications', component: NotificationsComponent, canActivate: [AuthGuard, CoachRestrictGuard] },
  { path: 'manage-content', component: StaticContentComponent, canActivate: [AuthGuard] },
  { path: 'privacy-terms', component: StaticContentComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },
  { path: 'video-library', component: VideoLibraryComponent, canActivate: [AuthGuard] },
  { path: 'nutrition-video-test', component: NutritionVideoTestComponent, canActivate: [AuthGuard] },
  { path: 'fitness-hub', component: FitnessHubComponent, canActivate: [AuthGuard] },
  { path: 'fitness-videos', component: FitnessVideosComponent, canActivate: [AuthGuard] },
  { path: 'nutrition-hub', component: NutritionHubComponent, canActivate: [AuthGuard] },
  { path: 'spirit-mindset-hub', component: SpiritMindsetHubComponent, canActivate: [AuthGuard] },
  { path: 'workout-builder', loadChildren: () => import('./pages/workout-builder/workout-builder.module').then(m => m.WorkoutBuilderModule), canActivate: [AuthGuard] },
  {
    path: 'manage-content',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: StaticContentComponent
      },
      {
        path: 'intro-videos',
        component: IntroVideosComponent
      },
      {
        path: 'intro-videos/add',
        component: AddIntroVideoComponent
      },
      {
        path: 'intro-videos/edit/:id',
        component: AddIntroVideoComponent
      }
    ]
  },
  { path: 'manage-intro-videos',
    canActivate: [AuthGuard, CoachRestrictGuard],
    children: [
      {
        path: '',
        component: IntroVideosComponent,
      },
      {
        path: 'intro-video-detail/:id',
        component: AddIntroVideoComponent
      }
    ]
  },
  { path: 'add-intro-video', component: AddIntroVideoComponent, canActivate: [AuthGuard, CoachRestrictGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
