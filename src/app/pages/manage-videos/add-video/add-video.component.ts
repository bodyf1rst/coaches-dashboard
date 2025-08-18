import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/service/data.service';
import { urlValidator } from 'src/app/validations/urlValidator';

@Component({
  selector: 'app-add-video',
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.scss']
})
export class AddVideoComponent implements OnInit {
  public isEdit: boolean = false;
  public isSubmitted: boolean = false;
  public vId: any = null;
  public vForm: any = null;
  public videoData: any = null
  public imageUrl: any = null;
  public videoObj: any = null;
  public videoPlaying: boolean = false;
  public videoPlayer: any;
  public showIcon: boolean = false;
  public imageObj: any = null;
  public assignmentList: any = [];

  constructor(public dataService: DataService, public activeRoute: ActivatedRoute, public router: Router) {

  }

  ngOnInit(): void {
    this.vForm = new FormGroup({
      video_title: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
      video_format: new FormControl('file', [Validators.required]),
      type: new FormControl('Public', [Validators.required]),
      video_url: new FormControl(null, [urlValidator()]),
      video_file: new FormControl(null),
      tags: new FormControl([]),
      video_thumbnail: new FormControl(null),
    });

    this.activeRoute.params.subscribe((res: any) => {
      this.vId = Number(res.id) || null;
      if (this.vId) {
        this.initializeData();
      } else {
        this.onEdit();
      }
    });

    this.vForm.get('video_format')?.valueChanges.subscribe((value: string) => {
      this.onTypeChange(value);
    });
  }

  get f() {
    return this.vForm.controls;
  }

  goBack() {
    if (this.isEdit && this.vId) { this.isEdit = false } else {
      history.back()
    }
  }

  toggleVideo() {
    try {
      if (!this.videoPlaying) {
        this.videoPlayer?.play();
        this.videoPlaying = true;
      } else {
        this.videoPlayer?.pause();
        this.videoPlaying = false;
      }
      this.showIcon = true;
      setTimeout(() => {
        this.showIcon = false;
      }, 1000)
    } catch (error) {
      console.error(error);
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file instanceof Blob) {
      this.imageObj = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imageUrl = e.target?.result;
      reader.readAsDataURL(file);
    }
  }

  async onFileSelected(event: any) {
    var videoData: any = await this.dataService.utils.readVideoUrl(event);
    if (videoData?.videoUrl) {
      this.videoObj = videoData;
      this.imageUrl = videoData.videoThumbnail;
      this.vForm.get('video_file').setValue(event.target.files[0]);
    }
  }

  removeImage(): void {
    this.imageUrl = null;
    this.imageObj = null;
    this.videoObj = null;
    this.vForm.get('video_thumbnail').value = '';
  }

  initializeData() {
    this.videoData = this.dataService.videosList?.videos?.find((x: any) => x.id == this.vId);
    if (this.videoData?.id) {
      this.patchData(this.videoData);
    } else {
      this.getSingleVideoData();
    }
  }

  getSingleVideoData() {
    this.dataService.httpService.getApiData(this.dataService.httpService.getSingleVideoApi + this.vId)
      .then((res: any) => {
        this.videoData = res.video;
        this.patchData(res.video);
        let videoIndex = this.dataService.videosList?.videos?.findIndex((c: any) => c.id == this.videoData.id);
        if (videoIndex > -1) {
          this.dataService.videosList.videos[videoIndex] = this.videoData;
        }
      })
      .catch((errors: any) => {
        if (errors.error.message === "Video Not Found!") {
          this.dataService.utils.showToast('danger', errors.error.message);
          window.history.back();
          return;
        }
        this.dataService.onApiError(errors);
      })
      .finally(() => {
        this.dataService.isLoading = false;
      });
  }

  onTypeChange(type: string) {
    this.removeImage();
  }

  patchData(data: any) {
    this.vForm.patchValue({
      type: data.type,
      video_format: data.video_format,
      video_title: data.video_title,
      video_url: data.video_url || null,
      tags: data.tags || [],
    });

    this.imageUrl = data.video_thumbnail || null;
    setTimeout(() => {
      this.videoPlayer = document.getElementById('videoPlayer');
    }, 1000);
  }

  onEdit() {
    this.isEdit = !this.isEdit;
    if (!this.dataService.tagsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getTagsApi, 'tags', 'tagsDropdown').then(() => {
        if (this.isEdit && this.vId) {
          this.patchData(this.videoData);
        }
        return;
      });
    }
    if (this.isEdit && this.vId) {
      this.patchData(this.videoData);
    }
  }

  onSubmitForm() {
    this.isSubmitted = true;

    if (this.vForm.valid) {
      if (this.imageObj?.size) {
        var imageSizeValid = this.dataService.utils.validateImageSize(this.imageObj)
        if (!imageSizeValid) {
          return
        }
      }
      this.dataService.isLoading = true;
      this.isSubmitted = false;
      const appendedFormData: FormData = new FormData();
      Object.keys(this.vForm.controls).forEach(key => {
        const value = this.vForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item, idx) => {
              appendedFormData.append(`${key}[${idx}]`, item);
            })
          } else {
            appendedFormData.append(key, value);
          }
        }
      });
      if (!this.videoObj?.videoUrl && !this.imageUrl && this.vForm.get('video_format')?.value === 'file') {
        this.dataService.utils.showToast('danger', 'Please Add Video.');
        this.dataService.isLoading = false;
        return;
      }
      if (this.vForm.get('video_format')?.value === 'url' && !this.vForm.get('video_url')?.value) {
        this.dataService.utils.showToast('danger', 'Please Add Video Url.');
        this.dataService.isLoading = false;
        return;
      }
      if (this.videoObj?.videoUrl) {
        appendedFormData.delete('video_file');
        appendedFormData.delete('video_duration');
        appendedFormData.delete('video_thumbnail');
        appendedFormData.append('video_file', this.videoObj.videoFileData);
        appendedFormData.append('video_duration', this.videoObj.videoDuration);
        appendedFormData.append('video_thumbnail', this.imageUrl);
      }
      if (!this.videoObj?.videoUrl && this.imageObj instanceof File || this.imageObj instanceof Blob) {
        appendedFormData.delete('video_thumbnail');
        appendedFormData.append('video_thumbnail', this.imageObj);
      }
      if (this.imageUrl && !this.imageObj && this.vForm.get('video_format').value == 'url') {
        appendedFormData.delete('video_thumbnail');
      }
      if (this.imageUrl && this.videoObj && this.vForm.get('video_format').value == 'file') {
        appendedFormData.delete('video_thumbnail');
        appendedFormData.append('video_thumbnail', this.imageUrl);
      }
      if (this.imageUrl && !this.videoObj && this.vForm.get('video_format').value == 'file') {
        appendedFormData.delete('video_thumbnail');
      }
      if (this.imageObj && this.vForm.get('video_format').value == 'url') {
        appendedFormData.delete('video_thumbnail');
        appendedFormData.append('video_thumbnail', this.imageObj);
      }
      const apiName = this.vId
        ? this.dataService.httpService.updateVideoApi + this.vId
        : this.dataService.httpService.addVideosApi;

      this.dataService.httpService.postApiFileData(apiName, appendedFormData).then((res: any) => {

        this.videoObj = null;
        this.imageObj = null;

        this.videoData = res.video;
        this.imageUrl = this.videoData.video_thumbnail || null;
        if (this.dataService.videosList?.videos?.length) {
          let videoIndex = this.dataService.videosList?.videos?.findIndex((c: any) => c.id == this.videoData.id);
          if (videoIndex > -1) {
            this.dataService.videosList.videos[videoIndex] = this.videoData;
          } else {
            this.dataService.videosList.videos.unshift(this.videoData)
            this.dataService.router.navigateByUrl('/manage-videos')
          }
        } else {
          this.dataService.router.navigateByUrl('/manage-videos/video-detail/' + this.videoData.id)
        }
        this.isEdit = false;
        this.dataService.utils.showToast('success', res.message);
        this.dataService.getDashboardData();
      }).catch((errors: any) => {
        this.dataService.utils.showToast('danger', errors.error.message);
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    } else {
      this.dataService.utils.showToast('danger', 'Please Check Required Fields.');
    }
  }

  action() {
    if (this.vId) {
      this.dataService.isLoading = true;
      let data = { is_active: this.videoData.is_active == 0 ? this.videoData.is_active = 1 : this.videoData.is_active = 0 };
      let path: any = this.dataService.httpService.updateVideoApi + this.vId;
      this.dataService.httpService.postApiData(path, data).then((res: any) => {
        this.videoData = res.video;
        if (this.dataService.videosList?.videos?.length) {
          let videoIndex = this.dataService.videosList?.videos?.findIndex((c: any) => c.id == this.videoData.id);
          if (videoIndex > -1) {
            this.dataService.videosList.videos[videoIndex] = this.videoData;
          }
        }
        document.getElementById('closeActionModal')?.click();
        this.dataService.utils.showToast('success', res.message);
        this.dataService.isLoading = false;
      }).catch((errors: any) => {
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  delete() {
    if (this.vId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteVideoApi + this.vId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.videosList?.videos?.length) {
          let videoIndex = this.dataService.videosList?.videos?.findIndex((c: any) => c.id == this.videoData.id);
          if (videoIndex > -1) {
            this.dataService.videosList.videos.splice(videoIndex, 1);
          }
        }
        this.videoData = {}
        this.vId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/manage-videos');
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

  searchTags(event: any) {
    if (event?.term && !event?.items?.length) {
      let apiUrlWithParams = `${this.dataService.httpService.getTagsApi}?limit=10`;
      apiUrlWithParams += `&search=${encodeURIComponent(event.term)}`;
      this.dataService.httpService.getApiData(apiUrlWithParams)
        .then((res: any) => {
          this.dataService.tagsDropdown.unshift(...res.tags);
        })
        .catch((errors: any) => {
          this.dataService.onApiError(errors);
        });
    }
  }

  cloneItem(itemId: any, type: any) {
    this.dataService.cloneItem(itemId, type).then((res: any) => {
      this.dataService.router.navigateByUrl('/manage-videos/video-detail/' + res.video.id)
      this.onEdit();
    })
  }

  checkDeletion() {
    this.dataService.checkDeletion(this.vId, 'video').then((res: any) => {
      this.assignmentList = res.data.exercises_data || [];
    }).catch((errors: any) => {
      this.dataService.onApiError(errors);
    })
  }
}
