import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exercise-tab',
  templateUrl: './exercise-tab.component.html',
  styleUrls: ['./exercise-tab.component.scss']
})
export class ExerciseTabComponent implements OnInit {
  @Input() item: any = {}
  showVideo: boolean = false;
  showDetails: boolean = false;
  thumbnailError: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Log the item to see what data we're getting
    console.log('Exercise item:', this.item);
    
    // Add mock transcription for testing
    if (this.item && !this.item.transcription) {
      this.item.transcription = this.generateMockTranscription();
    }
    
    // Convert MOV to MP4 URL if needed
    if (this.item?.video_url) {
      this.item.video_url = this.getCompatibleVideoUrl(this.item.video_url);
    }
  }
  
  getCompatibleVideoUrl(url: string): string {
    // Ensure MP4 format for better compatibility
    if (url && url.includes('.mov')) {
      return url.replace('.mov', '.mp4');
    }
    
    // Use streaming endpoint for better compatibility
    if (this.item?.id) {
      return `http://api.bodyf1rst.net/api/admin/stream-video.php?id=${this.item.id}`;
    }
    
    return url;
  }

  toggleVideo(): void {
    this.showVideo = !this.showVideo;
    if (this.showVideo) {
      // Play video when toggled on
      setTimeout(() => {
        const videoEl = document.querySelector(`video[src="${this.item?.video_url}"]`) as HTMLVideoElement;
        if (videoEl) {
          videoEl.play();
        }
      }, 100);
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  onThumbnailError(event: any): void {
    this.thumbnailError = true;
    event.target.style.display = 'none';
  }

  onVideoLoaded(event: any): void {
    console.log('Video metadata loaded');
    // Video loaded successfully, can extract frame if needed
  }

  onVideoError(event: any): void {
    console.log('Video error:', event);
    this.thumbnailError = true;
  }

  getPosterFrame(): string {
    // Try to use thumbnail URL first, fallback to empty
    if (this.item?.thumbnail_url) {
      return this.item.thumbnail_url;
    }
    // Return empty string to let video show first frame
    return '';
  }

  onImageError(event: any): void {
    // Hide the image and show gradient background with play icon
    event.target.style.display = 'none';
    // The gradient background will show through automatically
  }

  generateMockTranscription(): string {
    const transcriptions = [
      "Welcome to this exercise. Today we'll be focusing on proper form and technique. Remember to keep your core engaged throughout the movement.",
      "This workout targets multiple muscle groups. Start with a warm-up and gradually increase intensity. Focus on controlled movements.",
      "Begin in a standing position. Keep your back straight and breathe steadily throughout the exercise. Perform 3 sets of 10-12 repetitions."
    ];
    return transcriptions[Math.floor(Math.random() * transcriptions.length)];
  }

  playExercise(): void {
    if (this.item?.video_url) {
      // Open video in new tab
      window.open(this.item.video_url, '_blank');
    } else if (this.item?.id) {
      // Navigate to exercise detail
      window.location.href = `/exercise-detail/${this.item.id}`;
    }
  }

}
