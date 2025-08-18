import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-add-nutritions-videos',
  templateUrl: './add-nutritions-videos.component.html',
  styleUrls: ['./add-nutritions-videos.component.scss']
})
export class AddNutritionsVideosComponent implements OnInit {
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
  public imageObj: any = null

  constructor(public dataService: DataService, public activeRoute: ActivatedRoute, public router: Router) {
    if (!this.dataService?.introVideos?.generalVideos?.videos.length) {
      this.dataService.fetchData(
        1,
        this.dataService.httpService.introVideos,
        'videos',
        'introVideos',
        '',
        `&type=General`,
        'generalVideos');
    }
  }

  ngOnInit(): void {
    this.vForm = new FormGroup({
      video_title: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]),
      type: new FormControl('Nutrition', [Validators.required]),
      video: new FormControl(null, [Validators.required]),
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
      this.vForm.get('video').setValue(event.target.files[0]);
    }
  }

  removeImage(): void {
    this.imageUrl = null;
    this.imageObj = null;
    this.videoObj = null;
    this.vForm.get('video_thumbnail').value = '';
  }

  initializeData() {
    this.videoData = this.dataService.introVideos?.generalVideos?.videos?.find((x: any) => x.id == this.vId);
    if (!this.videoData) {
      this.videoData = this.dataService.introVideos?.nutritionVideos?.videos?.find((x: any) => x.id == this.vId);
    }
    if (this.videoData?.id) {
      this.patchData(this.videoData);
    } else {
      this.getSingleVideoData();
    }
  }

  getSingleVideoData() {
    this.dataService.httpService.getApiData(this.dataService.httpService.singleIntroVideos + this.vId)
      .then((res: any) => {
        this.videoData = res.video;
        this.patchData(res.video);
        var listName = res.video.type == 'General' ? 'generalVideos' : 'nutritionVideos';
        let videoIndex = this.dataService.introVideos[listName]?.videos?.findIndex((c: any) => c.id == this.videoData.id);
        if (videoIndex > -1) {
          this.dataService.introVideos[listName].videos[videoIndex] = this.videoData;
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
      video_title: data.video_title,
      video: data.video || null
    });

    this.imageUrl = data.video_thumbnail || null;
    setTimeout(() => {
      this.videoPlayer = document.getElementById('videoPlayer');
    }, 1000);
  }

  onEdit() {
    this.isEdit = !this.isEdit;
    if (this.isEdit && this.vId) {
      this.patchData(this.videoData);
    }
  }

  onSubmitForm() {
    this.isSubmitted = true;
    if (this.vForm.valid) {
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
      if (!this.videoObj?.videoUrl && !this.imageUrl) {
        this.dataService.utils.showToast('danger', 'Please Add Video.');
        this.dataService.isLoading = false;
        return;
      }
      if (this.videoObj?.videoUrl) {
        appendedFormData.delete('video');
        appendedFormData.delete('video_duration');
        appendedFormData.delete('video_thumbnail');
        appendedFormData.append('video', this.videoObj.videoFileData);
        appendedFormData.append('video_duration', this.videoObj.videoDuration);
        appendedFormData.append('video_thumbnail', this.imageUrl);
      }
      if (!this.videoObj?.videoUrl && this.imageObj instanceof File || this.imageObj instanceof Blob) {
        appendedFormData.delete('video_thumbnail');
        appendedFormData.append('video_thumbnail', this.imageObj);
      }
      const apiName = this.vId
        ? this.dataService.httpService.updateIntroVideos + this.vId
        : this.dataService.httpService.addIntroVideos;
      this.dataService.httpService.postApiFileData(apiName, appendedFormData).then((res: any) => {
        this.videoObj = null;
        this.imageObj = null;
        this.videoData = res.video;
        this.imageUrl = this.videoData.video_thumbnail || null;
        var listName = res.video.type == 'General' ? 'generalVideos' : 'nutritionVideos';
        if (this.dataService.introVideos[listName]?.videos?.length) {
          let videoIndex = this.dataService.introVideos[listName]?.videos?.findIndex((c: any) => c.id == this.videoData.id);
          if (videoIndex > -1) {
            this.dataService.introVideos[listName].videos[videoIndex] = this.videoData;
          } else {
            var otherListName = res.video.type == 'General' ? 'nutritionVideos' : 'generalVideos';
            let videoIndex = this.dataService.introVideos[otherListName]?.videos?.findIndex((c: any) => c.id == this.videoData.id);
            if (videoIndex > -1) {
              this.dataService.introVideos[otherListName].videos.splice(videoIndex, 1);
            }
            this.dataService.introVideos[listName].videos.unshift(this.videoData)
            this.dataService.router.navigateByUrl('/nutrition-videos')
          }
        } else {
          this.dataService.router.navigateByUrl('./nutrition-video-detail/' + this.videoData.id)
        }
        if (res.video.type == 'General') {
          this.dataService.fetchData(
            1,
            this.dataService.httpService.introVideos,
            'videos',
            'introVideos',
            '',
            `&type=General`,
            'generalVideos');
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
      let data = { is_active: this.videoData.is_active == 0 ? 1 : 0 };
      let path: any = this.dataService.httpService.updateIntroVideos + this.vId;
      this.dataService.httpService.postApiData(path, data).then((res: any) => {
        document.getElementById('closeActionModal')?.click();
        setTimeout(() => {
          this.videoData = res.video;
          var listName = res.video.type == 'General' ? 'generalVideos' : 'nutritionVideos';
          if (this.dataService.introVideos[listName]?.videos?.length) {
            let videoIndex = this.dataService.introVideos[listName].videos?.findIndex((c: any) => c.id == this.videoData.id);
            if (videoIndex > -1) {
              this.dataService.introVideos[listName].videos[videoIndex] = this.videoData;
            }
          }
          if (res.video.type == 'General') {
            this.dataService.fetchData(
              1,
              this.dataService.httpService.introVideos,
              'videos',
              'introVideos',
              '',
              `&type=General`,
              'generalVideos');
          }
          this.dataService.utils.showToast('success', res.message);
          this.dataService.isLoading = false;
        }, 1000)

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
      let path: any = this.dataService.httpService.deleteIntroVideos + this.vId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        var listName = this.videoData.type == 'General' ? 'generalVideos' : 'nutritionVideos';
        if (this.dataService.introVideos[listName].videos?.length) {
          let videoIndex = this.dataService.introVideos[listName]?.videos?.findIndex((c: any) => c.id == this.videoData.id);
          if (videoIndex > -1) {
            this.dataService.introVideos[listName].videos.splice(videoIndex, 1);
          }
        }
        this.videoData = {}
        this.vId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/nutrition-videos');
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