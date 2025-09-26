import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.scss']
})
export class VideoLibraryComponent implements OnInit {
  videos: any[] = [];
  filteredVideos: any[] = [];
  paginatedVideos: any[] = [];
  selectedCategory = 'all';
  searchText = '';
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;
  selectedTags: string[] = [];
  allTags: string[] = [];
  searchMode: 'title' | 'tags' | 'transcription' | 'all' = 'all';

  categories = [
    { value: 'all', label: 'All Videos' },
    { value: 'workout', label: 'Workouts' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'mindset', label: 'Mindset' },
    { value: 'marketing', label: 'Marketing' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.isLoading = true;
    // All videos from S3 bucket
    const videoList = [
      'Ab Roll Out.mov',
      'Ab Slider.mov',
      'Ab Wheel Roll Out.mov',
      'Adored Health.mov',
      'Alternating High Pull Ups.mov',
      'Alternating High Cable Row.mov',
      'Alternating Lateral Lunges with Barbell.mov',
      'Alternating Lateral Lunges with curl and press.mov',
      'Arm Circles Forward.mov',
      'Arm Circles Reverse.mov',
      'Arms Crossed Overhead Stretch.mov',
      'Arms Crossed To Sides.mov',
      'Arnold Db Press.mov',
      'Around The World.mov',
      'Assisted Pull Up.mov',
      'Back Fly With Band.mov',
      'Back Hyper Extensions.mov',
      'Back To The Wall Shoulder Flexion.mov',
      'Backward Lunges.mov',
      'Balance On Hands.mov',
      'Ball Crunch.mov',
      'Ball Hamstring Curls.mov',
      'Ball Pull Over.mov',
      'Ball Push Up.mov',
      'Ball Reverse Crunch.mov',
      'Ball Squat.mov',
      'Ball Wall Squat.mov',
      'Band Bent Over Row.mov',
      'Band Bicep Curl.mov',
      'Band Chest Press.mov',
      'Band Front Raise.mov',
      'Band Glute Kick Backs.mov',
      'Band Lateral Raise.mov',
      'Band Pull Apart.mov',
      'Band Reverse Fly.mov',
      'Band Row.mov',
      'Band Squat.mov',
      'Band Tricep Extension.mov',
      'Barbell Back Squat.mov',
      'Barbell Bent Over Row.mov',
      'Barbell Bicep Curl.mov',
      'Barbell Front Squat.mov',
      'Barbell Hip Thrust.mov',
      'Barbell Overhead Press.mov',
      'Barbell Row.mov',
      'Barbell Shrugs.mov',
      'Battle Ropes.mov',
      'Bear Crawl.mov',
      'Bench Dips.mov',
      'Bench Press.mov',
      'Bent Over Cable Fly.mov',
      'Bent Over Db Fly.mov',
      'Bent Over Db Row.mov',
      'Bent Over Single Arm Cable Row.mov',
      'Bicep Cable Curl.mov',
      'Bicep Db Curl.mov',
      'Bicycle Crunch.mov',
      'Bird Dog.mov',
      'Box Jump.mov',
      'Box Step Ups.mov',
      'Broad Jump.mov',
      'Bulgarian Split Squat.mov',
      'Burpees.mov',
      'Cable Chest Fly.mov',
      'Cable Crunch.mov',
      'Cable Face Pulls.mov',
      'Cable Front Raise.mov',
      'Cable Glute Kick Back.mov',
      'Cable Lateral Raise.mov',
      'Cable Pull Through.mov',
      'Cable Row.mov',
      'Cable Tricep Extension.mov',
      'Calf Raises.mov',
      'Cat Cow Stretch.mov',
      'Chest Dips.mov',
      'Chest Fly Machine.mov',
      'Chest Press Machine.mov',
      'Chin Ups.mov',
      'Clam Shells.mov',
      'Clean And Press.mov',
      'Close Grip Bench Press.mov',
      'Close Grip Push Up.mov',
      'Cossack Squat.mov',
      'Crab Walk.mov',
      'Cross Body Hammer Curl.mov',
      'Crossover Step Up.mov',
      'Curtsy Lunge.mov',
      'Dead Bug.mov',
      'Deadlift.mov',
      'Decline Bench Press.mov',
      'Decline Sit Up.mov',
      'Diamond Push Up.mov',
      'Donkey Kicks.mov',
      'Double Leg Hip Thrust.mov',
      'Dumbbell Bench Press.mov',
      'Dumbbell Chest Fly.mov',
      'Dumbbell Chest Press.mov',
      'Dumbbell Clean.mov',
      'Dumbbell Deadlift.mov',
      'Dumbbell Front Raise.mov',
      'Dumbbell Lateral Raise.mov',
      'Dumbbell Lunge.mov',
      'Dumbbell Overhead Press.mov',
      'Dumbbell Pull Over.mov',
      'Dumbbell Row.mov',
      'Dumbbell Shoulder Press.mov',
      'Dumbbell Shrugs.mov',
      'Dumbbell Side Bend.mov',
      'Dumbbell Squat.mov',
      'Dumbbell Step Up.mov',
      'Dumbbell Tricep Extension.mov',
      'Elevated Glute Bridge.mov',
      'Elevated Push Up.mov',
      'Face Pulls.mov',
      'Farmer Walk.mov',
      'Fire Hydrants.mov',
      'Flutter Kicks.mov',
      'Forward Lunges.mov',
      'Front Plank.mov',
      'Front Raise.mov',
      'Front Squat.mov',
      'Glute Bridge.mov',
      'Glute Ham Raise.mov',
      'Glute Kickback Machine.mov',
      'Goblet Squat.mov',
      'Good Morning.mov',
      'Hack Squat.mov',
      'Hammer Curl.mov',
      'Hamstring Curl Machine.mov',
      'Hanging Knee Raise.mov',
      'Hanging Leg Raise.mov',
      'High Knees.mov',
      'High Pull.mov',
      'Hip Abduction Machine.mov',
      'Hip Adduction Machine.mov',
      'Hip Circles.mov',
      'Hip Thrust.mov',
      'Incline Bench Press.mov',
      'Incline Dumbbell Press.mov',
      'Incline Push Up.mov',
      'Inverted Row.mov',
      'Jack Knife.mov',
      'Jumping Jacks.mov',
      'Jump Rope.mov',
      'Jump Squat.mov',
      'Kettlebell Swing.mov',
      'Kneeling Cable Crunch.mov',
      'Kneeling Push Up.mov',
      'Landmine Press.mov',
      'Landmine Row.mov',
      'Lat Pull Down.mov',
      'Lateral Band Walk.mov',
      'Lateral Lunge.mov',
      'Lateral Raise.mov',
      'Leg Curl.mov',
      'Leg Extension.mov',
      'Leg Press.mov',
      'Leg Raise.mov',
      'Lunge.mov',
      'Lying Leg Curl.mov',
      'Lying Tricep Extension.mov',
      'Machine Chest Press.mov',
      'Machine Fly.mov',
      'Machine Preacher Curl.mov',
      'Machine Row.mov',
      'Medicine Ball Slam.mov',
      'Military Press.mov',
      'Mountain Climbers.mov',
      'Narrow Grip Pull Up.mov',
      'Neutral Grip Pull Up.mov',
      'Oblique Crunch.mov',
      'Overhead Cable Extension.mov',
      'Overhead Press.mov',
      'Overhead Squat.mov',
      'Overhead Tricep Extension.mov',
      'Pallof Press.mov',
      'Pec Deck.mov',
      'Pendlay Row.mov',
      'Pike Push Up.mov',
      'Pistol Squat.mov',
      'Plank.mov',
      'Plank Jack.mov',
      'Plank to Push Up.mov',
      'Plate Raise.mov',
      'Preacher Curl.mov',
      'Pull Through.mov',
      'Pull Up.mov',
      'Push Press.mov',
      'Push Up.mov',
      'Rack Pull.mov',
      'Rear Delt Fly.mov',
      'Rear Foot Elevated Split Squat.mov',
      'Reverse Crunch.mov',
      'Reverse Fly.mov',
      'Reverse Grip Row.mov',
      'Reverse Lunge.mov',
      'Romanian Deadlift.mov',
      'Rope Climb.mov',
      'Rope Face Pull.mov',
      'Rope Pushdown.mov',
      'Rope Tricep Extension.mov',
      'Russian Twist.mov',
      'Scissor Kicks.mov',
      'Seated Cable Row.mov',
      'Seated Calf Raise.mov',
      'Seated Dumbbell Press.mov',
      'Seated Leg Curl.mov',
      'Seated Row.mov',
      'Shoulder Press.mov',
      'Shoulder Shrugs.mov',
      'Shrugs.mov',
      'Side Bend.mov',
      'Side Lateral Raise.mov',
      'Side Lunge.mov',
      'Side Plank.mov',
      'Single Arm Cable Row.mov',
      'Single Arm Dumbbell Row.mov',
      'Single Leg Deadlift.mov',
      'Single Leg Glute Bridge.mov',
      'Single Leg Press.mov',
      'Sit Up.mov',
      'Skullcrusher.mov',
      'Sled Push.mov',
      'Smith Machine Press.mov',
      'Smith Machine Squat.mov',
      'Snatch.mov',
      'Split Squat.mov',
      'Squat.mov',
      'Squat Jump.mov',
      'Squat to Press.mov',
      'Standing Calf Raise.mov',
      'Standing Cable Chest Press.mov',
      'Standing Cable Fly.mov',
      'Standing Dumbbell Curl.mov',
      'Standing Overhead Press.mov',
      'Static Lunge.mov',
      'Step Up.mov',
      'Stiff Leg Deadlift.mov',
      'Straight Arm Pulldown.mov',
      'Straight Leg Raise.mov',
      'Sumo Deadlift.mov',
      'Sumo Squat.mov',
      'Superman.mov',
      'T-Bar Row.mov',
      'Thrusters.mov',
      'Tire Flip.mov',
      'Toe Touch.mov',
      'Trap Bar Deadlift.mov',
      'Tricep Dips.mov',
      'Tricep Extension.mov',
      'Tricep Kickback.mov',
      'Tricep Pushdown.mov',
      'Turkish Get Up.mov',
      'Upright Row.mov',
      'V-Ups.mov',
      'Walking Lunge.mov',
      'Wall Ball.mov',
      'Wall Sit.mov',
      'Wide Grip Lat Pulldown.mov',
      'Wide Grip Pull Up.mov',
      'Wide Grip Row.mov',
      'Wide Push Up.mov',
      'Wood Chop.mov',
      'Wrist Curl.mov',
      'Y-Raise.mov',
      'Zottman Curl.mov'
    ];

    // Convert file names to video objects with tags and mock transcriptions
    this.videos = videoList.map((fileName, index) => {
      const title = fileName.replace('.mov', '').replace(/([A-Z])/g, ' $1').trim();
      const tags = this.generateTags(title);
      
      return {
        id: index + 1,
        title: title,
        category: 'workout',
        duration: '0:30',
        url: `https://bodyf1rst-workout-video-storage.s3.amazonaws.com/${encodeURIComponent(fileName)}`,
        thumbnail: this.generateThumbnailUrl(fileName),
        tags: tags,
        transcription: this.generateMockTranscription(title), // Mock for now
        transcriptionStatus: Math.random() > 0.3 ? 'completed' : 'pending',
        s3Key: fileName
      };
    });

    // Extract all unique tags
    const tagSet = new Set<string>();
    this.videos.forEach(video => {
      video.tags.forEach((tag: string) => tagSet.add(tag));
    });
    this.allTags = Array.from(tagSet).sort();

    this.filterVideos();
    this.isLoading = false;
    
    // Simulate AWS Transcribe integration
    this.startTranscriptionJobs();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterVideos();
  }

  onSearch(): void {
    this.filterVideos();
  }

  filterVideos(): void {
    this.filteredVideos = this.videos.filter(video => {
      // Category filter
      const categoryMatch = this.selectedCategory === 'all' || video.category === this.selectedCategory;
      
      // Tag filter
      const tagMatch = this.selectedTags.length === 0 || 
        this.selectedTags.every(tag => video.tags.includes(tag));
      
      // Search filter based on mode
      let searchMatch = true;
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        switch (this.searchMode) {
          case 'title':
            searchMatch = video.title.toLowerCase().includes(searchLower);
            break;
          case 'tags':
            searchMatch = video.tags.some((tag: string) => tag.toLowerCase().includes(searchLower));
            break;
          case 'transcription':
            searchMatch = video.transcription && video.transcription.toLowerCase().includes(searchLower);
            break;
          case 'all':
            searchMatch = video.title.toLowerCase().includes(searchLower) ||
              video.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
              (video.transcription && video.transcription.toLowerCase().includes(searchLower));
            break;
        }
      }
      
      return categoryMatch && tagMatch && searchMatch;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredVideos.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedVideos = this.filteredVideos.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  generateTags(title: string): string[] {
    const tags = [];
    const lowerTitle = title.toLowerCase();
    
    // Equipment tags
    if (lowerTitle.includes('dumbbell') || lowerTitle.includes('db')) tags.push('dumbbells');
    if (lowerTitle.includes('barbell')) tags.push('barbell');
    if (lowerTitle.includes('cable')) tags.push('cable');
    if (lowerTitle.includes('band')) tags.push('resistance band');
    if (lowerTitle.includes('ball')) tags.push('exercise ball');
    if (lowerTitle.includes('machine')) tags.push('machine');
    
    // Body part tags
    if (lowerTitle.includes('chest') || lowerTitle.includes('pec')) tags.push('chest');
    if (lowerTitle.includes('back') || lowerTitle.includes('lat') || lowerTitle.includes('row')) tags.push('back');
    if (lowerTitle.includes('shoulder') || lowerTitle.includes('delt')) tags.push('shoulders');
    if (lowerTitle.includes('bicep') || lowerTitle.includes('curl')) tags.push('biceps');
    if (lowerTitle.includes('tricep')) tags.push('triceps');
    if (lowerTitle.includes('leg') || lowerTitle.includes('squat') || lowerTitle.includes('lunge')) tags.push('legs');
    if (lowerTitle.includes('glute') || lowerTitle.includes('hip')) tags.push('glutes');
    if (lowerTitle.includes('ab') || lowerTitle.includes('core') || lowerTitle.includes('crunch')) tags.push('core');
    if (lowerTitle.includes('calf')) tags.push('calves');
    
    // Exercise type tags
    if (lowerTitle.includes('press')) tags.push('press');
    if (lowerTitle.includes('pull')) tags.push('pull');
    if (lowerTitle.includes('squat')) tags.push('squat');
    if (lowerTitle.includes('deadlift')) tags.push('deadlift');
    if (lowerTitle.includes('stretch')) tags.push('flexibility');
    if (lowerTitle.includes('plank')) tags.push('isometric');
    
    return tags;
  }

  playVideo(video: any): void {
    // Open video in modal or new tab
    window.open(video.url, '_blank');
    
    // In the future, this will open a modal with the video player
    // and display the transcription if available
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.filterVideos();
  }

  clearFilters(): void {
    this.selectedTags = [];
    this.selectedCategory = 'all';
    this.searchText = '';
    this.filterVideos();
  }

  generateMockTranscription(title: string): string {
    // Mock transcription for demonstration
    // In production, this will be replaced with actual AWS Transcribe data
    const transcriptions: { [key: string]: string } = {
      'squat': 'Begin with feet shoulder-width apart. Lower your body by bending at the knees and hips. Keep your chest up and core engaged. Push through your heels to return to standing position.',
      'press': 'Start with weights at shoulder level. Press upward in a controlled motion. Fully extend arms without locking elbows. Lower back to starting position with control.',
      'curl': 'Hold weights with palms facing forward. Keep elbows stationary at your sides. Curl weights toward shoulders. Slowly lower back to starting position.',
      'row': 'Hinge forward at the hips. Pull weights toward your torso. Squeeze shoulder blades together. Return to starting position with control.',
      'deadlift': 'Stand with feet hip-width apart. Hinge at hips, keeping back straight. Grip the bar and drive through heels to stand. Keep core engaged throughout movement.'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, value] of Object.entries(transcriptions)) {
      if (lowerTitle.includes(key)) {
        return value;
      }
    }
    
    return `Professional exercise demonstration for ${title}. This exercise targets multiple muscle groups and should be performed with proper form and control.`;
  }

  startTranscriptionJobs(): void {
    // Simulate AWS Transcribe job initialization
    // In production, this would trigger actual AWS Transcribe jobs
    console.log('Starting AWS Transcribe jobs for videos without transcriptions...');
    
    const pendingVideos = this.videos.filter(v => v.transcriptionStatus === 'pending');
    
    // Simulate processing some videos
    pendingVideos.slice(0, 5).forEach((video, index) => {
      setTimeout(() => {
        video.transcriptionStatus = 'processing';
        console.log(`Started transcription for: ${video.title}`);
        
        // Simulate completion
        setTimeout(() => {
          video.transcriptionStatus = 'completed';
          video.transcription = this.generateMockTranscription(video.title);
          console.log(`Completed transcription for: ${video.title}`);
        }, 5000 + (index * 1000));
      }, index * 500);
    });
  }

  triggerAwsTranscribe(video: any): void {
    // This method would be called to manually trigger AWS Transcribe for a specific video
    const params = {
      s3Uri: `s3://bodyf1rst-workout-video-storage/${video.s3Key}`,
      outputBucket: 'bodyf1rst-transcriptions',
      languageCode: 'en-US',
      jobName: `transcribe-${video.id}-${Date.now()}`
    };
    
    console.log('AWS Transcribe params:', params);
    // In production: this.awsService.startTranscriptionJob(params)
  }

  generateThumbnailUrl(fileName: string): string {
    // Generate actual S3 thumbnail URLs
    // These thumbnails should be generated by AWS MediaConvert when videos are uploaded
    const baseName = fileName.replace('.mov', '');
    
    // Try actual S3 thumbnail URL first
    // Format: video name with _thumbnail.jpg suffix
    const thumbnailUrl = `https://bodyf1rst-workout-video-storage.s3.amazonaws.com/thumbnails/${encodeURIComponent(baseName)}_thumbnail.jpg`;
    
    // You can also use the first frame of the video as a poster
    // This requires CORS to be properly configured on S3
    // Alternative: Use video poster frame
    // const videoUrl = `https://bodyf1rst-workout-video-storage.s3.amazonaws.com/${encodeURIComponent(fileName)}#t=0.5`;
    
    // For now, return the thumbnail URL
    // If thumbnail doesn't exist, the placeholder will be shown
    return thumbnailUrl;
  }

  extractVideoFrame(videoUrl: string): Promise<string> {
    // This method would extract a frame from the video to use as thumbnail
    // Uses HTML5 video element and canvas
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.currentTime = 1; // Seek to 1 second
      
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg');
          resolve(thumbnailUrl);
        } else {
          reject('Failed to get canvas context');
        }
      };
      
      video.onerror = () => {
        reject('Failed to load video');
      };
    });
  }

  onThumbnailError(event: any, video: any): void {
    // Handle thumbnail load error
    console.log(`Thumbnail failed to load for: ${video.title}`);
    video.thumbnailError = true;
    
    // Try to use video poster frame as fallback
    // This creates a video element and uses the poster attribute
    const videoElement = event.target as HTMLImageElement;
    
    // Hide the failed image
    videoElement.style.display = 'none';
    
    // Optionally, try to extract frame from video
    // this.extractVideoFrame(video.url).then(dataUrl => {
    //   video.thumbnail = dataUrl;
    //   video.thumbnailError = false;
    // }).catch(err => {
    //   console.error('Failed to extract video frame:', err);
    // });
  }

  // Alternative: Use video element as thumbnail
  createVideoThumbnail(video: any): string {
    // Returns a video element that will show first frame
    return `<video src="${video.url}" muted preload="metadata" style="width: 100%; height: 100%;"></video>`;
  }
}
// Force rebuild at Thu Sep 25 20:14:00 CDT 2025
