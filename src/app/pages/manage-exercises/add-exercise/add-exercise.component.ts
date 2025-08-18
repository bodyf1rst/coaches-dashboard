import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { urlValidator } from 'src/app/validations/urlValidator';

@Component({
  selector: 'app-add-exercise',
  templateUrl: './add-exercise.component.html',
  styleUrls: ['./add-exercise.component.scss']
})
export class AddExerciseComponent implements OnInit, OnDestroy {
  public videoPlaying: boolean = false;
  public isEdit: boolean = false;
  public isSubmitted: boolean = false;
  public exId: any = null;
  public exForm: any = null;
  public exData: any = {}
  public imageUrl: any = null;
  public imageObj: any = {};
  public videoPlayer: any;
  public showIcon: any = true;
  public selectedVideos: any[] = [];
  public patchedVideos: any[] = [];
  public fieldText: any = '';
  public isSearched: boolean = false;
  public pageFilter: any = new pageFilter;
  public assignmentList: any = [];
  public refreshActive: boolean = false;
  public videoObj: any = null;

  constructor(public dataService: DataService, public activeRoute: ActivatedRoute, public router: Router) {

  }

  ngOnInit(): void {
    this.initializeForm()
    this.activeRoute.params.subscribe((res: any) => {
      this.exId = Number(res.id) || null;
      if (this.exId) {
        this.initializeData();
      } else {
        this.onEdit();
      }
    });
  }

  initializeForm() {
    this.exForm = new FormGroup({
      video_format: new FormControl('file', [Validators.required]),
      video_url: new FormControl(null, [urlValidator()]),
      video_file: new FormControl(null),
      video_thumbnail: new FormControl(null),
      title: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
      description: new FormControl(''),
      tags: new FormControl([]),
      visibility_type: new FormControl('Public', [Validators.required])
    });

    this.exForm.get('video_format')?.valueChanges.subscribe((value: string) => {
      this.onTypeChange(value);
    });
  }

  get f() {
    return this.exForm.controls;
  }

  onTypeChange(type: string) {
    this.removeImage();
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
      this.exForm.get('video_file').setValue(event.target.files[0]);
    }
  }

  removeImage(): void {
    this.imageUrl = null;
    this.imageObj = null;
    this.videoObj = null;
    this.exForm.get('video_thumbnail').value = '';
  }
  goBack() {
    if (this.isEdit && this.exId) { this.isEdit = false } else {
      history.back()
    }
  }

  onSearch() {
    let filterQuery = '';
    ['status', 'uploaded_by', 'coach_id'].forEach((filterKey) => {
      if (this.pageFilter[filterKey]) {
        filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
      }
    });
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getVideosApi,
      'videos',
      'videosList',
      this.fieldText, filterQuery
    ).then(() => {
      this.selectedVideos = []
      if (this.fieldText) {
        this.isSearched = true;
      }
    })
  }

  clearSearch(isDistroy?: boolean) {
    if (!isDistroy) {
      this.getFreshVideos()
    }
    this.fieldText = null;
    this.isSearched = false;
    this.pageFilter = new pageFilter;
  }

  openInNewTab() {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/add-video']));
    window.open(url, '_blank');
  }


  getFreshVideos() {
    this.dataService.fetchData(1, this.dataService.httpService.getVideosApi, 'videos', 'videosList')
  }

  refreshData() {
    this.refreshActive = true;
    setTimeout(() => {
      this.dataService.fetchData(1, this.dataService.httpService.getVideosApi, 'videos', 'videosList').then(() => {
        this.refreshActive = false;
      }).catch(() => {
        this.refreshActive = false;
      })
    }, 1000)

  }

  getVideos() {
    if (!this.dataService.videosList.videos?.length) {
      this.dataService.fetchData(1, this.dataService.httpService.getVideosApi, 'videos', 'videosList')
    }
    this.selectedVideos = JSON.parse(JSON.stringify(this.patchedVideos));
  }

  toggleVideoSelection(video: any): void {
    const index = this.selectedVideos.findIndex(v => v.id === video.id);
    if (index > -1) {
      this.selectedVideos.splice(index, 1);
    } else {
      this.selectedVideos = [];
      this.selectedVideos.push(video);
    }
  }

  // toggleVideo(video: any, videoPlayer: HTMLVideoElement, event: Event): void {
  //   event.stopPropagation();
  //   this.dataService.videosList?.videos?.forEach((v: any) => {
  //     if (v.videoPlaying && v !== video) {
  //       v.videoPlaying = false;
  //       const playingVideoElement = document.getElementById(`video-${v.id}`) as HTMLVideoElement;
  //       if (playingVideoElement) {
  //         playingVideoElement.pause();
  //       }
  //     }
  //   });
  //   if (video?.video_url) {
  //     window.open(video?.video_url, '_blank');
  //     return;
  //   }
  //   if (video.videoPlaying) {
  //     videoPlayer.pause();
  //     video.videoPlaying = false;
  //   } else {
  //     videoPlayer.play();
  //     video.videoPlaying = true;
  //   }
  // }

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

  onVideoClick(video: any, event: Event): void {

    event.stopPropagation();
    this.toggleVideoSelection(video)
  }

  onClickVideo(event: Event) {
    event.stopPropagation();
  }

  isSelected(video: any): boolean {
    return this.selectedVideos.some(v => v.id === video.id);
  }

  // onImageSelected(event: Event): void {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //   if (file instanceof Blob) {
  //     this.imageObj = file;
  //     const reader = new FileReader();
  //     reader.onload = (e) => this.imageUrl = e.target?.result;
  //     reader.readAsDataURL(file);
  //   }
  // }

  removeVideo() {
    this.selectedVideos = [];
    this.patchedVideos = [];
    this.initializeForm()
  }

  patchedData() {
    this.patchedVideos = this.selectedVideos;
    this.exForm.patchValue({
      title: this.patchedVideos[0].video_title,
      tags: this.patchedVideos[0].tags
    })
  }

  initializeData() {

    this.exData = this.dataService.exercisesList?.exercises?.find((x: any) => x.id == this.exId);
    if (this.exData?.id) {
      this.patchData(this.exData);
    } else {
      this.getSingleExercise();
    }
  }

  getSingleExercise() {
    this.dataService.httpService.getApiData(this.dataService.httpService.getSingleExerciseApi + this.exId).then((res: any) => {
      this.exData = res.exercise;
      this.patchData(res.exercise);
      let exerciseIndex = this.dataService.exercisesList?.exercises?.findIndex((c: any) => c.id == this.exData.id);
      if (exerciseIndex > -1) {
        this.dataService.exercisesList.exercises[exerciseIndex] = this.exData;
      }
    }).catch((errors: any) => {
      if (errors.error.message == "Exercise Not Found!") {
        this.dataService.utils.showToast('danger', errors.error.message);
        window.history.back();
        return
      }
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  patchData(Data: any) {
    this.exForm.patchValue({
      video_format: Data?.video?.video_format,
      video_url: Data?.video?.video_url || null,
      title: Data.title,
      description: Data.description || '',
      tags: Data.tags,
      visibility_type: Data.visibility_type,
    });
    this.imageUrl = Data?.video?.video_thumbnail || null;
    setTimeout(() => {
      this.videoPlayer = document.getElementById('videoPlayer');
    }, 1000);
  }

  // patchData(Data: any) {
  //   this.exForm.patchValue({
  //     title: Data.title,
  //     description: Data.description || '',
  //     tags: Data.tags,
  //     visibility_type: Data.visibility_type,
  //   });
  //   this.patchedVideos = Data.videos;
  // }

  onEdit() {
    this.isEdit = !this.isEdit;
    if (!this.dataService.tagsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getTagsApi, 'tags', 'tagsDropdown').then(() => {
        if (this.isEdit && this.exId) {
          this.patchData(this.exData);
        }
        return;
      });
    }
    // Old
    // if (!this.patchedVideos.length || this.patchedVideos != this.exData.videos) {
    //   this.patchedVideos = this.exData.videos;
    // }
    if (this.isEdit && this.exId) {
      this.patchData(this.exData);
    }
  }

  onSubmitForm() {
    this.isSubmitted = true;

    if (this.exForm.valid) {
      if (this.imageObj?.size) {
        var imageSizeValid = this.dataService.utils.validateImageSize(this.imageObj)
        if (!imageSizeValid) {
          return
        }
      }
      this.dataService.isLoading = true;
      this.isSubmitted = false;
      const appendedFormData: FormData = new FormData();
      Object.keys(this.exForm.controls).forEach(key => {
        const value = this.exForm.get(key)?.value;
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
      if (!this.videoObj?.videoUrl && !this.imageUrl && this.exForm.get('video_format')?.value === 'file') {
        this.dataService.utils.showToast('danger', 'Please Add Video.');
        this.dataService.isLoading = false;
        return;
      }
      if (this.exForm.get('video_format')?.value === 'url' && !this.exForm.get('video_url')?.value) {
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
      if (this.imageUrl && !this.imageObj && this.exForm.get('video_format').value == 'url') {
        appendedFormData.delete('video_thumbnail');
      }
      if (this.imageUrl && this.videoObj && this.exForm.get('video_format').value == 'file') {
        appendedFormData.delete('video_thumbnail');
        appendedFormData.append('video_thumbnail', this.imageUrl);
      }
      if (this.imageUrl && !this.videoObj && this.exForm.get('video_format').value == 'file') {
        appendedFormData.delete('video_thumbnail');
      }
      if (this.imageObj && this.exForm.get('video_format').value == 'url') {
        appendedFormData.delete('video_thumbnail');
        appendedFormData.append('video_thumbnail', this.imageObj);
      }
      const apiName = this.exId
        ? this.dataService.httpService.updateExerciseApi + this.exId
        : this.dataService.httpService.addExercisesApi;

      this.dataService.httpService.postApiFileData(apiName, appendedFormData).then((res: any) => {

        this.videoObj = null;
        this.imageObj = null;

        this.exData = res.exercise;
        if (this.dataService.exercisesList?.exercises?.length) {
          let exerciseIndex = this.dataService.exercisesList?.exercises?.findIndex((c: any) => c.id == this.exData.id);
          if (exerciseIndex > -1) {
            this.dataService.exercisesList.exercises[exerciseIndex] = this.exData;
          } else {
            this.dataService.exercisesList.exercises.unshift(this.exData)
            this.dataService.router.navigateByUrl('/manage-exercises')
          }
        } else {
          this.dataService.router.navigateByUrl('/manage-exercises/exercise-detail/' + this.exData.id)
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

  // onSubmitForm() {
  //   this.isSubmitted = true;
  //   if (this.exForm.valid) {
  //     const appendedFormData: FormData = new FormData();
  //     if (!this.patchedVideos?.length) {
  //       this.dataService.utils.showToast('danger', 'Please Attach Video!')
  //       return
  //     } else {
  //       this.patchedVideos.forEach((v, i) => {
  //         appendedFormData.delete(`videos[${i}]`);
  //         appendedFormData.append(`videos[${i}]`, v.id)
  //       })
  //     }
  //     this.dataService.isLoading = true;
  //     this.isSubmitted = false;
  //     Object.keys(this.exForm.controls).forEach(key => {
  //       debugger
  //       const value = this.exForm.get(key)?.value;
  //       if (value !== null && value !== undefined) {

  //         if (Array.isArray(value)) {

  //           value.forEach((item, idx) => {
  //             appendedFormData.append(`${key}[${idx}]`, item);
  //           })
  //         } else {
  //           appendedFormData.append(key, value);
  //         }
  //       }
  //     });
  //     const apiName = this.exId
  //       ? this.dataService.httpService.updateExerciseApi + this.exId
  //       : this.dataService.httpService.addExercisesApi;

  //     this.dataService.httpService.postApiData(apiName, appendedFormData).then((res: any) => {
  //       this.imageObj = {};
  //       this.exData = res.exercise;
  //       if (this.dataService.exercisesList?.exercises?.length) {
  //         let exerciseIndex = this.dataService.exercisesList?.exercises?.findIndex((c: any) => c.id == this.exData.id);
  //         if (exerciseIndex > -1) {
  //           this.dataService.exercisesList.exercises[exerciseIndex] = this.exData;
  //         } else {
  //           this.dataService.exercisesList.exercises.unshift(this.exData)
  //           this.dataService.router.navigateByUrl('/manage-exercises')
  //         }
  //       } else {
  //         this.dataService.router.navigateByUrl('/manage-exercises/exercise-detail/' + this.exData.id)
  //       }
  //       this.isEdit = false;
  //       this.dataService.utils.showToast('success', res.message);
  //       this.dataService.getDashboardData();
  //     }).catch((errors: any) => {
  //       this.dataService.utils.showToast('danger', errors.error.message);
  //       this.dataService.onApiError(errors);
  //     }).finally(() => {
  //       this.dataService.isLoading = false;
  //     });
  //   }
  // }

  action() {
    if (this.exId) {
      this.dataService.isLoading = true;
      let data = { is_active: this.exData.is_active == 0 ? this.exData.is_active = 1 : this.exData.is_active = 0 };
      let path: any = this.dataService.httpService.updateExerciseApi + this.exId;
      this.dataService.httpService.postApiData(path, data).then((res: any) => {
        this.exData = res.exercise;
        if (this.dataService.exercisesList?.exercises?.length) {
          let exerciseIndex = this.dataService.exercisesList?.exercises?.findIndex((c: any) => c.id == this.exData.id);
          if (exerciseIndex > -1) {
            this.dataService.exercisesList.exercises[exerciseIndex] = this.exData;
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
    if (this.exId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteExerciseApi + this.exId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.exercisesList?.exercises?.length) {
          let exerciseIndex = this.dataService.exercisesList?.exercises?.findIndex((c: any) => c.id == this.exData.id);
          if (exerciseIndex > -1) {
            this.dataService.exercisesList.exercises.splice(exerciseIndex, 1);
          }
        }
        this.exData = {}
        this.exId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/manage-exercises');
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

  cloneItem(itemId: any, type: any) {
    this.dataService.cloneItem(itemId, type).then((res: any) => {
      this.dataService.router.navigateByUrl('/manage-exercises/exercise-detail/' + res.exercise.id)
      this.onEdit();
    })
  }

  checkDeletion() {
    this.dataService.checkDeletion(this.exId, 'exercise').then((res: any) => {
      this.assignmentList = res.data.workouts || [];
    }).catch((errors: any) => {
      this.dataService.onApiError(errors);
    })
  }

  ngOnDestroy() {
    this.clearSearch(true);
  }
}
