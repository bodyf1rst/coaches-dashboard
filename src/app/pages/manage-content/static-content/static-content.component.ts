import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-static-content',
  templateUrl: './static-content.component.html',
  styleUrls: ['./static-content.component.scss']
})
export class StaticContentComponent implements OnInit {
  public faqForm: any = {};
  public faqFormSubmitted: boolean = false;
  public isEdit: boolean = false;
  public selectedFaq: any = '';

  constructor(public dataService: DataService, private fb: FormBuilder) {
    dataService.pageTabView = 'Terms Privacy';
    if (this.dataService.staticContent.status != '200') {
      this.getStaticContent();
    }
    if (!this.dataService.allFaqs.faqs?.length) {
      this.dataService.fetchData(1, this.dataService.httpService.getFaqs, 'faqs', 'allFaqs')
    }
  }

  ngOnInit(): void {
    this.faqForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(3)]],
      answer: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  getStaticContent() {
    this.dataService.isLoading = true;
    this.dataService.httpService.getApiData(this.dataService.httpService.getPrivacyTerms).then((res) => {
      this.dataService.staticContent = res;
      this.dataService.isLoading = false;
    }).catch((errors: any) => {
      this.dataService.onApiError(errors);
    });
  }

  patchFormValues() {
    this.faqForm.patchValue({
      question: this.selectedFaq.question,
      answer: this.selectedFaq.answer
    });
  }

  editFaq(faq: any) {
    this.isEdit = true
    this.selectedFaq = faq;
    this.patchFormValues()
  }

  addNewFaq() {
    this.clearForm();
    this.isEdit = false;
    this.selectedFaq = {}
  }

  onSubmit() {
    this.faqFormSubmitted = true;
    if (this.faqForm.valid) {
      var formData = this.faqForm.value;
      this.dataService.isFormSubmit = true;
      var selectedApi = this.isEdit ? this.dataService.httpService.updateFaqs + this.selectedFaq.id : this.dataService.httpService.addFaqs;
      this.dataService.httpService.postApiData(selectedApi, formData).then((res: any) => {

        if (!this.isEdit) {
          this.dataService.allFaqs.faqs.unshift(res.faq);
        } else {
          let itemIndex = this.dataService.allFaqs.faqs.findIndex((i: any) => i.id == this.selectedFaq.id);
          if (itemIndex > -1) {
            this.dataService.allFaqs.faqs[itemIndex] = res.faq;
          }
        }
        document.getElementById('closedRModal')?.click();
        this.clearForm();
        this.dataService.isFormSubmit = false;
        this.dataService.utils.showToast('success', res.message);
      }).catch((errors: any) => {
        this.dataService.onApiError(errors);
        this.dataService.isFormSubmit = false;
      });
    } else {
      console.log('Form is invalid');
    }
  }

  deleteFaq() {
    if (this.selectedFaq.id) {
      const selectedApi = this.dataService.httpService.deleteFaqs + this.selectedFaq.id;
      if (!selectedApi) {
        this.dataService.utils.showToast('danger', 'Invalid Action');
        this.dataService.isFormSubmit = false;
        return;
      }

      this.dataService.httpService.deleteApiData(selectedApi).then((res: any) => {
        let itemIndex = this.dataService.allFaqs.faqs.findIndex((i: any) => i.id == this.selectedFaq.id);
        if (itemIndex > -1) {
          this.dataService.allFaqs.faqs.splice(itemIndex, 1);
        }
        this.dataService.isFormSubmit = false;
        document.getElementById('closedModal')?.click();
        this.dataService.utils.showToast('success', res.message);
      }).catch((errors: any) => {
        this.dataService.utils.showToast('warning', errors.error.message);
        this.dataService.onApiError(errors);
        this.dataService.isFormSubmit = false;
      });
    }
  }

  clearForm() {
    this.faqForm.reset();
    this.faqFormSubmitted = false;
  }

  submitStaticContent() {
    this.dataService.isFormSubmit = true;
    this.dataService.httpService.postApiData(this.dataService.httpService.updatePrivacyTerms, this.dataService.staticContent.site_info).then((res: any) => {
      this.dataService.isFormSubmit = false;
      this.dataService.utils.showToast('success', res.message);
    }).catch((errors: any) => {
      this.dataService.onApiError(errors);
      this.dataService.isFormSubmit = false;
    });
  }
}
