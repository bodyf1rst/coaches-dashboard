import { NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { UserTabComponent } from './components/user-tab/user-tab.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ManageOrganizationsComponent } from './pages/manage-organizations/manage-organizations.component';
import { LeftSidebarComponent } from './components/left-sidebar/left-sidebar.component';
import { ShortProfileComponent } from './components/short-profile/short-profile.component';
import { AddOrganizationComponent } from './pages/manage-organizations/add-organization/add-organization.component';
import { OrganizationTabComponent } from './components/organization-tab/organization-tab.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ManageDepartmentsComponent } from './pages/manage-departments/manage-departments.component';
import { StringTabComponent } from './components/string-tab/string-tab.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ClientTabComponent } from './components/client-tab/client-tab.component';
import { AddClientComponent } from './pages/clients/add-client/add-client.component';
import { TooltipDirective } from './tooltip.directive';
import { ManagePreferencesComponent } from './pages/manage-preferences/manage-preferences.component';
import { HttpClientModule } from '@angular/common/http';
import { ManageCoachesComponent } from './pages/manage-coaches/manage-coaches.component';
import { AddCoachComponent } from './pages/manage-coaches/add-coach/add-coach.component';
import { CoachTabComponent } from './components/coach-tab/coach-tab.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ManageVideosComponent } from './pages/manage-videos/manage-videos.component';
import { VideoTabComponent } from './components/video-tab/video-tab.component';
import { AddVideoComponent } from './pages/manage-videos/add-video/add-video.component';
import { ManageChallengesComponent } from './pages/manage-challenges/manage-challenges.component';
import { AddChallengeComponent } from './pages/manage-challenges/add-challenge/add-challenge.component';
import { ChallengeTabComponent } from './components/challenge-tab/challenge-tab.component';
import { ChallengeDetailComponent } from './pages/manage-challenges/challenge-detail/challenge-detail.component';
import { NgxSortableModule } from 'ngx-sortable';
import { ManagePlansComponent } from './pages/manage-plans/manage-plans.component';
import { AddPlanComponent } from './pages/manage-plans/add-plan/add-plan.component';
import { PlanTabComponent } from './components/plan-tab/plan-tab.component'
import { DragulaModule } from 'ng2-dragula';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrganizationsSubmitionsComponent } from './pages/manage-organizations/organizations-submitions/organizations-submitions.component';
import { OrganizationRequestFormComponent } from './pages/manage-organizations/organization-request-form/organization-request-form.component';
import { ManageNutritionsComponent } from './pages/manage-nutritions/manage-nutritions.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ManageBodyPointsComponent } from './pages/manage-body-points/manage-body-points.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AddNewNotificationComponent } from './pages/notifications/add-new-notification/add-new-notification.component';
import { StaticContentComponent } from './pages/manage-content/static-content/static-content.component';
import { QuillModule } from 'ngx-quill';
import { Quill } from 'quill';
import { IntroVideosComponent } from './pages/manage-content/intro-videos/intro-videos.component';
import { AddIntroVideoComponent } from './pages/manage-content/intro-videos/add-intro-video/add-intro-video.component';
import { EmployeesComponent } from './pages/clients/employees/employees.component';
import { NutritionsVideosComponent } from './pages/manage-nutritions/nutritions-videos/nutritions-videos.component';
import { AddNutritionsVideosComponent } from './pages/manage-nutritions/add-nutritions-videos/add-nutritions-videos.component';
import { PlaceholderTabComponent } from './components/placeholder-tab/placeholder-tab.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { VideoLibraryComponent } from './pages/video-library/video-library.component';
import { NutritionVideoTestComponent } from './pages/nutrition-video-test/nutrition-video-test.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserTabComponent,
    ForgotPasswordComponent,
    ManageOrganizationsComponent,
    LeftSidebarComponent,
    ShortProfileComponent,
    AddOrganizationComponent,
    OrganizationTabComponent,
    ManageDepartmentsComponent,
    StringTabComponent,
    ClientsComponent,
    ClientTabComponent,
    AddClientComponent,
    TooltipDirective,
    ManagePreferencesComponent,
    ManageCoachesComponent,
    AddCoachComponent,
    CoachTabComponent,
    ProfileComponent,
    ManageVideosComponent,
    VideoTabComponent,
    AddVideoComponent,
    ManageChallengesComponent,
    AddChallengeComponent,
    ChallengeTabComponent,
    ChallengeDetailComponent,
    ManagePlansComponent,
    AddPlanComponent,
    PlanTabComponent,
    DashboardComponent,
    OrganizationsSubmitionsComponent,
    OrganizationRequestFormComponent,
    ManageNutritionsComponent,
    ChatComponent,
    ManageBodyPointsComponent,
    NotificationsComponent,
    AddNewNotificationComponent,
    StaticContentComponent,
    IntroVideosComponent,
    AddIntroVideoComponent,
    EmployeesComponent,
    NutritionsVideosComponent,
    AddNutritionsVideosComponent,
    PlaceholderTabComponent,
    LeaderboardComponent,
    VideoLibraryComponent,
    NutritionVideoTestComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSortableModule,
    DragulaModule.forRoot(),
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          ['blockquote',],//'code-block'

          // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction

          // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, true] }],

          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          // [{ 'font': [] }],
          [{ 'align': [] }],

          // ['clean'],                                         // remove formatting button

          ['link',]     //'image', 'video'                    // link and image, video
        ]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule implements OnInit {
  ngOnInit() {
    const Link = Quill.import('formats/link');
    Quill.register('formats/link', class extends Link {
      static create(value: any) {

        if (value) {
          // Check if the value has a protocol (http:// or https://)
          if (!/^https?:\/\//i.test(value)) {
            value = 'https://' + value; // Add https:// if missing
          }
        }
        return super.create(value);
      }
    });
  }
}
