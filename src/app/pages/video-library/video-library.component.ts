import { Component, OnInit } from '@angular/core';
import { S3VideoService, VideoMetadata } from '../../service/s3-video.service';
import { DataService } from '../../service/data.service';
import { UtilsService } from '../../service/utils.service';

@Component({
  selector: 'app-video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.scss']
})
export class VideoLibraryComponent implements OnInit {
  videos: VideoMetadata[] = [];
  filteredVideos: VideoMetadata[] = [];
  categories = [
    { value: 'workout', label: '💪 Workout Videos', icon: '💪' },
    { value: 'nutrition', label: '🥗 Nutrition Videos', icon: '🥗' },
    { value: 'mindset', label: '🧘 Spirit & Mindset', icon: '🧘' },
    { value: 'notification', label: '🔔 Push Notifications', icon: '🔔' }
  ];
  selectedCategory = 'workout';
  searchTags: string = '';
  selectedVideo: VideoMetadata | null = null;
  uploadProgress = 0;
  isUploading = false;
  showTranscription = false;

  // Upload form data
  newVideo = {
    title: '',
    description: '',
    category: 'workout',
    tags: '',
    transcription: '',
    file: null as File | null
  };

  constructor(
    private s3VideoService: S3VideoService,
    public dataService: DataService,
    private utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.dataService.isLoading = true;
    this.s3VideoService.getVideosByCategory(this.selectedCategory).subscribe(
      (videos) => {
        this.videos = videos;
        this.filteredVideos = videos;
        this.dataService.isLoading = false;
        
        // Auto-generate thumbnails for videos without them
        videos.forEach(video => {
          if (!video.thumbnailUrl) {
            this.generateThumbnail(video);
          }
        });
      },
      (error) => {
        this.dataService.isLoading = false;
        this.utils.showToast('danger', 'Failed to load videos');
        console.error('Error loading videos:', error);
      }
    );
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.loadVideos();
  }

  searchByTags(): void {
    if (!this.searchTags.trim()) {
      this.filteredVideos = this.videos;
      return;
    }

    const tags = this.searchTags.split(',').map(tag => tag.trim());
    this.dataService.isLoading = true;
    
    this.s3VideoService.searchVideosByTags(tags).subscribe(
      (videos) => {
        this.filteredVideos = videos;
        this.dataService.isLoading = false;
      },
      (error) => {
        this.dataService.isLoading = false;
        this.utils.showToast('danger', 'Failed to search videos');
      }
    );
  }

  selectVideo(video: VideoMetadata): void {
    this.selectedVideo = video;
    this.showTranscription = false;
  }

  toggleTranscription(): void {
    this.showTranscription = !this.showTranscription;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        this.utils.showToast('danger', 'File size must be less than 500MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('video/')) {
        this.utils.showToast('danger', 'Please select a valid video file');
        return;
      }

      this.newVideo.file = file;
    }
  }

  async uploadVideo(): Promise<void> {
    if (!this.newVideo.file || !this.newVideo.title) {
      this.utils.showToast('danger', 'Please fill all required fields');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    try {
      // Step 1: Get presigned URL from backend
      const uploadUrlResponse = await this.s3VideoService.getUploadUrl(
        this.newVideo.file.name,
        this.newVideo.file.type
      ).toPromise();

      // Step 2: Upload directly to S3
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          this.uploadProgress = Math.round((e.loaded / e.total) * 100);
        }
      });

      xhr.open('PUT', uploadUrlResponse.uploadUrl, true);
      xhr.setRequestHeader('Content-Type', this.newVideo.file.type);
      
      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(true);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = reject;
        xhr.send(this.newVideo.file);
      });

      // Step 3: Save video metadata
      const metadata: VideoMetadata = {
        id: '',
        title: this.newVideo.title,
        description: this.newVideo.description,
        category: this.newVideo.category as any,
        tags: this.newVideo.tags.split(',').map(tag => tag.trim()),
        transcription: this.newVideo.transcription,
        duration: 0,
        videoUrl: uploadUrlResponse.videoUrl,
        s3Key: uploadUrlResponse.s3Key,
        uploadedAt: new Date(),
        uploadedBy: this.dataService.currentUserData.email
      };

      await this.s3VideoService.saveVideoMetadata(metadata).toPromise();

      this.utils.showToast('success', 'Video uploaded successfully!');
      this.resetUploadForm();
      this.loadVideos();
    } catch (error) {
      console.error('Upload error:', error);
      this.utils.showToast('danger', 'Failed to upload video');
    } finally {
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }

  updateTranscription(video: VideoMetadata): void {
    const newTranscription = prompt('Edit transcription:', video.transcription);
    if (newTranscription !== null && newTranscription !== video.transcription) {
      this.s3VideoService.updateTranscription(video.id, newTranscription).subscribe(
        () => {
          video.transcription = newTranscription;
          this.utils.showToast('success', 'Transcription updated');
        },
        (error) => {
          this.utils.showToast('danger', 'Failed to update transcription');
        }
      );
    }
  }

  updateTags(video: VideoMetadata): void {
    const newTags = prompt('Edit tags (comma-separated):', video.tags.join(', '));
    if (newTags !== null) {
      const tagsArray = newTags.split(',').map(tag => tag.trim());
      this.s3VideoService.updateVideoTags(video.id, tagsArray).subscribe(
        () => {
          video.tags = tagsArray;
          this.utils.showToast('success', 'Tags updated');
        },
        (error) => {
          this.utils.showToast('danger', 'Failed to update tags');
        }
      );
    }
  }

  deleteVideo(video: VideoMetadata): void {
    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
      this.s3VideoService.deleteVideo(video.id).subscribe(
        () => {
          this.videos = this.videos.filter(v => v.id !== video.id);
          this.filteredVideos = this.filteredVideos.filter(v => v.id !== video.id);
          if (this.selectedVideo?.id === video.id) {
            this.selectedVideo = null;
          }
          this.utils.showToast('success', 'Video deleted successfully');
        },
        (error) => {
          this.utils.showToast('danger', 'Failed to delete video');
        }
      );
    }
  }

  generateThumbnail(video: VideoMetadata): void {
    this.s3VideoService.generateThumbnail(video.id).subscribe(
      (response) => {
        video.thumbnailUrl = response.thumbnailUrl;
      },
      (error) => {
        console.error('Failed to generate thumbnail:', error);
      }
    );
  }

  resetUploadForm(): void {
    this.newVideo = {
      title: '',
      description: '',
      category: 'workout',
      tags: '',
      transcription: '',
      file: null
    };
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.icon : '📹';
  }
}