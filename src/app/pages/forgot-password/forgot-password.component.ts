import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./../login/login.component.scss', './forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public forgotForm: any = {}
  public errorInvalid: boolean = false;

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
    this.forgotForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    })
  }

  get f() {
    return this.forgotForm.controls;
  }

  submitForm() {
    this.errorInvalid = true;
    if (this.forgotForm.valid) {
      this.dataService.isLoading = true;
      this.errorInvalid = false;
      var formData: any = this.forgotForm.value;
      this.dataService.httpService.postApiData(this.dataService.httpService.forgotPassApi, formData).then(async (res: any) => {
        this.dataService.router.navigateByUrl('/login')
        this.dataService.utils.showToast('success', res.message);
        this.dataService.isLoading = false;
      }).catch((errors: any) => {
        this.dataService.isLoading = false;
        this.dataService.utils.showToast('danger', errors.error.message)
      });
    }
  }


}
