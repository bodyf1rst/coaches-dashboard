import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/service/http.service';
import { DataService } from 'src/app/service/data.service';
import * as moment from 'moment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup = new FormGroup({});
  
  //  Enhanced Login with Two Access Levels
  public loginMode: 'default' | 'superman' | 'coach' = 'default';
  public showAccessButtons = true;
  public accessEmojis = {
    superman: '',
    coach: '',
    default: ''
  };

  // Missing properties
  public checkOtp: boolean = false;
  public otpNumber: any = null;
  public errorInvalid: boolean = false;
  public isCountdownActive: boolean = false;
  
  constructor(
    public formBuilder: FormBuilder,
    public httpService: HttpService,
    public router: Router,
    public dataService: DataService,
  ) { }

  public countdown: any = '';
  public countdownInterval: any;
  public countdownDisplay: string = '';
  public showPassword: boolean = false;

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  get f(): any {
    return this.loginForm.controls;
  }

  goBack() {
    this.checkOtp = false;
    this.otpNumber = null;
  }

  // 🦸‍♂️ Set Superman Access (Super Admin)
  setSupermanAccess(): void {
    this.loginMode = 'superman';
    this.showAccessButtons = false;
    
    // Pre-fill Super Admin credentials - Charley or Dustin
    this.loginForm.patchValue({
      email: 'Charley@bodyf1rst.com',  // Can also use Dustin@bodyf1rst.com
      password: ''  // User still needs to enter password
    });
  }

  // 👨‍🏫 Set Coach Access  
  setCoachAccess(): void {
    this.loginMode = 'coach';
    this.showAccessButtons = false;
    
    // Pre-fill Coach credentials - Ken
    this.loginForm.patchValue({
      email: 'Ken@bodyf1rst.com',  
      password: ''  // User still needs to enter password
    });
  }

  // 🔄 Reset to Default
  resetAccess(): void {
    this.loginMode = 'default';
    this.showAccessButtons = true;
    this.loginForm.reset();
  }

  // 🔐 Local Authentication Check
  checkLocalCredentials(): boolean {
    const email = this.loginForm.value.email?.toLowerCase();
    const password = this.loginForm.value.password;
    
    // Super Admin credentials
    const superAdmins = [
      { email: 'charley@bodyf1rst.com', password: 'Dustin$tinypenis!' },
      { email: 'dustin@bodyf1rst.com', password: 'Dustin$tinypenis!' }
    ];
    
    // Coach credentials
    const coaches = [
      { email: 'ken@bodyf1rst.com', password: 'Dustin$tinypenis!' }
    ];
    
    // Check Super Admin
    if (superAdmins.some(admin => admin.email === email && admin.password === password)) {
      // Set super admin data
      this.dataService.currentUserData = {
        email: email,
        role: 'Admin',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        isSuperAdmin: true
      };
      return true;
    }
    
    // Check Coach
    if (coaches.some(coach => coach.email === email && coach.password === password)) {
      // Set coach data
      this.dataService.currentUserData = {
        email: email,
        role: 'Coach',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        isSuperAdmin: false
      };
      return true;
    }
    
    return false;
  }

  submitForm(submitValue?: any) {
    this.errorInvalid = true;
    if (this.loginForm.valid) {
      // First check local credentials
      if (this.checkLocalCredentials()) {
        // Local authentication successful
        this.dataService.isLoading = false;
        this.dataService.isAdminUser = this.dataService.currentUserData.role === 'Admin';
        localStorage.setItem('userToken', 'local-auth-' + Date.now());
        this.dataService.userFetchedSubject.next(true);
        this.dataService.router.navigateByUrl('/dashboard');
        this.dataService.utils.showToast('success', 'Login successful!');
        return;
      }
      
      // If not local, proceed with API authentication
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
