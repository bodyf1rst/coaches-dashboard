import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DataService } from 'src/app/service/data.service';
import { UtilsService } from 'src/app/service/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: any = {}
  public errorInvalid: boolean = false;
  public checkOtp: boolean = false;
  public otpNumber: any = null;
  public isCountdownActive: boolean = false;
  public countdown: any = '';
  public countdownInterval: any;
  public countdownDisplay: string = '';
  public showPassword: boolean = false;

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    })

  }
  get f() {
    return this.loginForm.controls;
  }

  goBack() {
    this.checkOtp = false;
    this.otpNumber = null;
  }

  submitForm(submitValue?: any) {
    this.errorInvalid = true;
    if (this.loginForm.valid) {
      this.dataService.isLoading = true;
      this.errorInvalid = false;
      var formData: any = this.loginForm.value;
      // var apiName = this.otpNumber && !submitValue?.length ? this.dataService.httpService.verifyLogin : this.dataService.httpService.loginApi;
      // if (this.otpNumber && !submitValue?.length) {
      //   formData.otp = this.otpNumber;
      // }
      this.dataService.httpService.postApiData(this.dataService.httpService.loginApi, formData).then(async (res: any) => {
        // if (!this.otpNumber || (this.otpNumber && submitValue?.length)) {
        //   this.checkOtp = true;
        //   this.startCountdown();
        // } else {
        this.checkOtp = false;
        this.dataService.currentUserData = res.user;
        this.dataService.isAdminUser = this.dataService.isAdmin();
        localStorage.setItem('userToken', res.token)
        this.dataService.userFetchedSubject.next(true);
        this.dataService.router.navigateByUrl('/dashboard')
        // }
        this.dataService.utils.showToast('success', res.message, false, 50000);
        this.dataService.isLoading = false;
      }).catch((errors: any) => {
        this.dataService.userFetchedSubject.next(false);
        this.dataService.isLoading = false;
        this.dataService.utils.showToast('danger', errors.error.message)
      });
    }
  }

  startCountdown(): void {
    this.isCountdownActive = true;
    this.countdown = moment().add(1, 'minutes');
    this.updateCountdownDisplay();
    this.countdownInterval = setInterval(() => {
      if (moment().isBefore(this.countdown)) {
        this.updateCountdownDisplay();
      } else {
        this.isCountdownActive = false;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  updateCountdownDisplay(): void {
    const duration = moment.duration(this.countdown.diff(moment()));
    this.countdownDisplay = `${duration.seconds()}s`;
  }

}
