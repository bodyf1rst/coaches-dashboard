
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
      title: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
      description: new FormControl(''),
      tags: new FormControl([]),
      visibility_type: new FormControl('Public', [Validators.required])
    });
  }

  get f() {
    return this.exForm.controls;
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

  toggleVideo(video: any, videoPlayer: HTMLVideoElement, event: Event): void {
    event.stopPropagation();
    this.dataService.videosList?.videos?.forEach((v: any) => {
      if (v.videoPlaying && v !== video) {
        v.videoPlaying = false;
        const playingVideoElement = document.getElementById(`video-${v.id}`) as HTMLVideoElement;
        if (playingVideoElement) {
          playingVideoElement.pause();
        }
      }
    });
    if (video?.video_url) {
      window.open(video?.video_url, '_blank');
      return;
    }
    if (video.videoPlaying) {
      videoPlayer.pause();
      video.videoPlaying = false;
    } else {
      videoPlayer.play();
      video.videoPlaying = true;
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

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file instanceof Blob) {
      this.imageObj = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imageUrl = e.target?.result;
      reader.readAsDataURL(file);
    }
  }

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
      title: Data.title,
      description: Data.description || '',
      tags: Data.tags,
      visibility_type: Data.visibility_type,
    });
    this.patchedVideos = Data.videos;
  }

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
    if (!this.patchedVideos.length || this.patchedVideos != this.exData.videos) {
      this.patchedVideos = this.exData.videos;
    }
  }

  onSubmitForm() {
    this.isSubmitted = true;
    if (this.exForm.valid) {
      const appendedFormData: FormData = new FormData();
      if (!this.patchedVideos?.length) {
        this.dataService.utils.showToast('danger', 'Please Attach Video!')
        return
      } else {
        this.patchedVideos.forEach((v, i) => {
          appendedFormData.delete(`videos[${i}]`);
          appendedFormData.append(`videos[${i}]`, v.id)
        })
      }
      this.dataService.isLoading = true;
      this.isSubmitted = false;
      Object.keys(this.exForm.controls).forEach(key => {
        debugger
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
      const apiName = this.exId
        ? this.dataService.httpService.updateExerciseApi + this.exId
        : this.dataService.httpService.addExercisesApi;

      this.dataService.httpService.postApiData(apiName, appendedFormData).then((res: any) => {
        this.imageObj = {};
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
    }
  }

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