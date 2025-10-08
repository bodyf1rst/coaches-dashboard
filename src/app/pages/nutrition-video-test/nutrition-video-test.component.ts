import { Component } from '@angular/core';

@Component({
  selector: 'app-nutrition-video-test',
  templateUrl: './nutrition-video-test.component.html',
  styleUrls: ['./nutrition-video-test.component.scss']
})
export class NutritionVideoTestComponent {
  // PHASE 2: Hardcoded video + thumbnail - NO API, NO DATABASE, NO SERVICES
  videoUrl = 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/Ab%20Roll%20Out.mp4';
  thumbnailUrl = 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/thumbnails/Ab%20Roll%20Out.0000000.jpg';
  showVideo = false;

  playVideo() {
    this.showVideo = true;
  }
}
