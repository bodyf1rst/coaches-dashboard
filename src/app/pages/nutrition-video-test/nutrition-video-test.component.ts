import { Component } from '@angular/core';

@Component({
  selector: 'app-nutrition-video-test',
  templateUrl: './nutrition-video-test.component.html',
  styleUrls: ['./nutrition-video-test.component.scss']
})
export class NutritionVideoTestComponent {
  // PHASE 4: Added collapsible transcription, reordered layout
  videoUrl = 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/Ab%20Roll%20Out.mp4';
  thumbnailUrl = 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/thumbnails/Ab%20Roll%20Out.0000000.jpg';
  showVideo = false;
  showTranscription = false; // NEW: Control transcription collapse

  // Video metadata
  title = 'Ab Roll Out';
  transcription = 'Begin in a kneeling position with the ab wheel in front of you. Grip the handles firmly and engage your core. Slowly roll the wheel forward, extending your body while keeping your core tight and maintaining a neutral spine. Roll out as far as you can while maintaining control, then use your core strength to pull yourself back to the starting position. Keep your movements controlled and avoid arching your lower back.';
  duration = '1:00';
  category = 'Core Strength';

  // Tags for workout type (body parts, exercise type)
  workoutTags = ['core', 'abs', 'strength', 'stability'];

  // Tags for equipment needed
  equipmentTags = ['ab wheel', 'mat'];

  playVideo() {
    this.showVideo = true;
  }

  // NEW: Toggle transcription visibility
  toggleTranscription() {
    this.showTranscription = !this.showTranscription;
  }
}
