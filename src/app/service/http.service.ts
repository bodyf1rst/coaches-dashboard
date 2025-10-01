import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public isLiveMode: boolean = true; // CHANGED TO TRUE
  private baseUrl: string = this.isLiveMode ? 'https://api.bodyf1rst.net/api/admin/' : 'http://127.0.0.1:8001/api/admin/'; // CHANGED TO HTTPS!
  public progressBar: number = 0;
  public loginApi: string = 'login';
  public getProfileApi: string = 'get-my-profile';
  public updateProfileApi: string = 'update-profile';
  public logoutApi: string = 'logout';
  public getDashboardStats: string = 'get-dashboard-stats';
  public verifyLogin: string = 'verify-login-otp';
  public changePassApi: string = 'change-password';
  public sendOTPApi: string = 'send-forgot-otp';
  public sendCredentialEmail: string = 'send-user-credentials/';
  public forgotPassApi: string = 'send-reset-password-link';
  public addBulkDepartmentApi: string = 'add-bulk-department';
  public addDepartmentApi: string = 'add-department';
  public updateDepartmentApi: string = 'update-department';
  public getDepartmentApi: string = 'get-departments';
  public deleteDepartmentApi: string = 'delete-department/';
  public addRewardApi: string = 'add-reward';
  public updateRewardApi: string = 'update-reward';
  public getRewardsApi: string = 'get-rewards';
  public deleteRewardApi: string = 'delete-reward/';
  public addOrganizationApi: string = 'add-organization';
  public updateOrganizationApi: string = 'update-organization/';
  public getOrganizationsApi: string = 'get-organizations';
  public getSingleOrganizationsApi: string = 'get-organization/';
  public deleteOrganizationApi: string = 'delete-organization/';
  public getOrganizationByToken: string = 'get-organization-by-token/';
  public getOrganizationSubmitions: string = 'get-organization-submissions';
  public getDepartmentsDropdownApi: string = 'get-departments-dropdown';
  public getRewardsDropdownApi: string = 'get-rewards-dropdown';
  public importEmployeesApi: string = 'import-employees';
  public addEmployeeApi: string = 'add-employee';
  public updateEmployeeApi: string = 'update-employee/';
  public getSingleEmployeeApi: string = 'get-employee/';
  public deleteEmployeeApi: string = 'delete-employee/';
  public deleteBulkEmployeesApi: string = 'delete-bulk-employee';
  public getEmployeesApi: string = 'get-employees';
  public getUsersDropdownApi: string = 'get-user-dropdown';
  public getAllUsersDropdownApi: string = 'get-users-drop-down';
  public getOrganizationDropdown: string = 'get-organizations-dropdown';
  public getPlansDropdown: string = 'get-plans-dropdown';
  public getEquipmentDropdown: string = 'get-equipment-preferences-dropdown';
  public getTrainingDropdown: string = 'get-training-preferences-dropdown';
  public getDietaryRestrictionsDropdownApi: string = 'get-dietary-restrictions-dropdown';
  public addDietaryRestrictionApi: string = 'add-dietary-restriction';
  public updateDietaryRestrictionApi: string = 'update-dietary-restriction';
  public getSingleDietaryRestrictionApi: string = 'get-dietary-restriction';
  public deleteDietaryRestrictionApi: string = 'delete-dietary-restriction/';
  public getDietaryRestrictionsApi: string = 'get-dietary-restrictions';
  public addTrainingApi: string = 'add-training-preference';
  public updateTrainingApi: string = 'update-training-preference';
  public getSingleTrainingApi: string = 'get-training-preference';
  public deleteTrainingApi: string = 'delete-training-preference/';
  public getTrainingApi: string = 'get-training-preferences';
  public addEquipmentApi: string = 'add-equipment-preference';
  public updateEquipmentApi: string = 'update-equipment-preference';
  public deleteEquipmentApi: string = 'delete-equipment-preference/';
  public getEquipmentsApi: string = 'get-equipment-preferences';
  public getSingleEquipmentApi: string = 'get-equipment-preference';
  public getCoachesApi: string = 'get-coaches';
  public getCoachesDropdown: string = 'get-coaches-dropdown';
  public getSingleCoachApi: string = 'get-coach/';
  public addCoachApi: string = 'add-coach';
  public updateCoachApi: string = 'update-coach/';
  public deleteCoachApi: string = 'delete-coach/';
  public getChallengesApi: string = 'get-challenges';
  public getSingleChallengeApi: string = 'get-challenge/';
  public addChallengeApi: string = 'add-challenge';
  public updateChallengeApi: string = 'update-challenge/';
  public deleteChallengeApi: string = 'delete-challenge/';
  public getChallengeTypeDropdown: string = 'get-challenge-types';
  public getVideosApi: string = 'get-videos.php'; // FIXED: Points to PHP endpoint with 509 videos!
  public addVideosApi: string = 'add-video';
  public getSingleVideoApi: string = 'get-video/';
  public updateVideoApi: string = 'update-video/';
  public deleteVideoApi: string = 'delete-video/';
  public getTagsApi: string = 'get-video-tags';
  public getExercisesApi: string = 'get-exercises.php' // FIXED: Points to PHP endpoint with 513 exercises!
  public addExercisesApi: string = 'add-exercise'
  public getSingleExerciseApi: string = 'get-exercise/';
  public updateExerciseApi: string = 'update-exercise/';
  public deleteExerciseApi: string = 'delete-exercise/';
  public getWorkoutsApi: string = 'get-workouts'
  public addWorkoutApi: string = 'add-workout'
  public getSingleWorkoutApi: string = 'get-workout/';
  public updateWorkoutApi: string = 'update-workout/';
  public deleteWorkoutApi: string = 'delete-workout/';
  public getPlansApi: string = 'get-plans'
  public addPlanApi: string = 'add-plan'
  public getSinglePlanApi: string = 'get-plan/';
  public updatePlanApi: string = 'update-plan/';
  public deletePlanApi: string = 'delete-plan/';
  public assignPlan: string = 'assign-plan';
  public deleteAssignPlan: string = 'delete-assign-plan/';
  public closeVideo: string = 'clone-video/'
  public closeExercise: string = 'clone-exercise/'
  public closeWorkout: string = 'clone-workout/'
  public closePlan: string = 'clone-plan/'
  public getNuritionCalculation: string = 'get-nutrition-calculations'
  public updateNuritionCalculation: string = 'update-nutrition-calculation'
  public resetNuritionCalculation: string = 'restore-nutrition-calculation?meta_key='
  public getBodyPoints: string = 'get-body-points';
  public updateBodyPoints: string = 'update-body-point';
  public getNotificaitons: string = 'get-notifications'
  public sendNotifications: string = 'send-notification'
  public deleteNotification: string = 'delete-notification/'
  public getFaqs: string = 'get-faqs'
  public addFaqs: string = 'add-faq'
  public updateFaqs: string = 'update-faq/'
  public deleteFaqs: string = 'delete-faq/'
  public getPrivacyTerms: string = 'get-site-info'
  public updatePrivacyTerms: string = 'update-site-info'
  public introVideos: string = 'get-intro-videos'
  public singleIntroVideos: string = 'get-intro-video/'
  public addIntroVideos: string = 'add-intro-video'
  public updateIntroVideos: string = 'update-intro-video/'
  public deleteIntroVideos: string = 'delete-intro-video/'
  public checkDeletion: string = 'check-deletion/';
  // Leaderboard API endpoints
  public getLeaderboard: string = 'customer/leaderboard';
  public getUserRank: string = 'customer/user-rank';
  public getOrganizations: string = 'get-organizations';

  constructor(public http: HttpClient) {

  }

  getHeaderOptions() {
    let userToken = localStorage.getItem('userToken');
    let httpOptions: any = {
      headers: new HttpHeaders({ 'Authorization': 'Bearer ' + userToken })
    }
    return httpOptions;
  }

  getHeaderOptionsWithJson() {
    let userToken = localStorage.getItem('userToken');
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + userToken,
        'Content-Type': 'application/json'
      })
    };
    return httpOptions;
  }

  getApiData(path: any) {
    let finalPath: any = this.baseUrl.concat(path);
    return this.http.get(finalPath, this.getHeaderOptions()).toPromise();
  }

  postApiData(path: any, data: any) {
    let finalPath: any = this.baseUrl.concat(path);
    return this.http.post(finalPath, data, this.getHeaderOptions()).toPromise();
  }

  postApiDataWithJson(path: any, data: any) {
    let finalPath: any = this.baseUrl.concat(path);
    return this.http.post(finalPath, data, this.getHeaderOptionsWithJson()).toPromise();
  }

  postApiFileData(path: any, data: any) {
    return new Promise((resolve, reject) => {
      let finalPath: any = this.baseUrl.concat(path);
      this.progressBar = 0;
      return this.http.post(finalPath, data, {
        ...this.getHeaderOptions(),
        reportProgress: true,
        observe: 'events'
      }).subscribe((event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.progressBar = Math.round((100 * event.loaded) / event.total);
          }
        } else if (event.type === HttpEventType.Response) {
          resolve(event.body)
          this.progressBar = 0;
        }
      }, (error) => {
        console.error('Upload failed:', error);
        this.progressBar = 0;
        reject(error)
      });
    })
  }


  deleteApiData(path: any) {
    let finalPath: any = this.baseUrl.concat(path);
    return this.http.delete(finalPath, this.getHeaderOptions()).toPromise();
  }

}
