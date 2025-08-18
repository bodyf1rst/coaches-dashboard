import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-challenge-detail',
  templateUrl: './challenge-detail.component.html',
  styleUrls: ['./challenge-detail.component.scss']
})
export class ChallengeDetailComponent implements OnInit {
  public challengeData: any = {}
  public challengeId: any = null;
  constructor(public dataService: DataService, public activeRoute: ActivatedRoute) {
    dataService.pageTabView = 'Leaderboard'
  }

  ngOnInit(): void {
    if (!this.dataService?.challengesList?.challenges?.length) {
      this.dataService.fetchData(1, this.dataService.httpService.getChallengesApi, 'challenges', 'challengesList')
    }
    this.activeRoute.params.subscribe((res: any) => {
      this.challengeId = res.id;
      if (this.challengeId) {
        this.initializeData();
      } else {
        this.dataService.router.navigateByUrl('/manage-challenges')
      }
    });
  }

  initializeData() {
    this.challengeData = this.dataService.challengesList?.challenges?.find((x: any) => x.id == this.challengeId);
    if (!this.challengeData?.id || !this.challengeData?.users?.length) {
      this.getSingleChallengeData();
    }
  }

  getSingleChallengeData() {
    let path = this.challengeId;
    let finalPath = this.dataService.httpService.getSingleChallengeApi + path;
    this.dataService.httpService.getApiData(finalPath).then((res: any) => {
      this.challengeData = res.challenge;
      let challengeIndex = this.dataService.challengesList?.challenges?.findIndex((c: any) => c.id == this.challengeData.id);
      if (challengeIndex > -1) {
        this.dataService.challengesList.challenges[challengeIndex] = this.challengeData;
      }
    }).catch((errors: any) => {
      if (errors.error.message == "Challenge Not Found") {
        this.dataService.utils.showToast('danger', errors.error.message);
        window.history.back();
        return
      }
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  getTabData(tabView: any) {
    this.dataService.pageTabView = tabView;
  }

  delete() {
    if (this.challengeId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteChallengeApi + this.challengeId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.challengesList?.challenges?.length) {
          let challengeIndex = this.dataService.challengesList?.challenges?.findIndex((c: any) => c.id == this.challengeData.id);
          if (challengeIndex > -1) {
            this.dataService.challengesList.challenges.splice(challengeIndex, 1);
          }
        }
        this.challengeData = {}
        this.challengeId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/manage-challenges');
        this.dataService.utils.showToast('success', res.message);
        this.dataService.getDashboardData();
        this.dataService.isLoading = false;
      }).catch((errors: any) => {
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }
}
