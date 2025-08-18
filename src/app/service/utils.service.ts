import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
declare var bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  toastEl: any;
  toast: any;
  imagePreview: any = '';
  passwordPattern: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/;
  phonePattern: any = /^\+1\s?(\(?[0-9]{3}\)?[-.\s]?)([0-9]{3})[-.\s]?([0-9]{4})$/;
  videoExtensionsList: string[] = ['.mp4', '.mov', '.avi', '.wmv', '.mkv', '.webm', '.mpg', '.mp2', '.m4p', '.ogg'];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(private sanitizer: DomSanitizer) { }
  // This function use for initialize toast.
  initializeToast(autoHide?: boolean, delay?: any): void {
    this.toastEl = document.getElementById('liveToast');
    if (this.toastEl) {
      this.toast = new bootstrap.Toast(this.toastEl, {
        autohide: autoHide || true,
        delay: delay || 2000
      });
    }
  }
  // This function use for display toast.
  showToast(toastType: string, message: string, autoHide?: boolean, delay?: any): void {
    this.initializeToast(autoHide, delay);
    if (this.toast) {
      this.toast.type = toastType;
      this.toast.message = message;
      this.toast.show();
    }
  }
  
  // This function use for check video file validation + create thumbnail.
  async readVideoUrl(event: any) {
    return new Promise(async (resolve, reject) => {
      var self = this, videoObj: any = {}, files = event.target.files;
      if (files?.length && self.isVideoFile(files[0].name)) {
        if (self.validateVideoSize(files[0])) {
          var duration: any = await self.validateVideoLength(files[0])
          if (duration && duration >= 3) {
            videoObj.videoDuration = Math.floor(duration);
            videoObj.videoFileData = files[0];
            videoObj.videoUrl = self.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(files[0]));
            // Create a temporary video element to generate the thumbnail
            var video = document.createElement('video');
            video.src = URL.createObjectURL(files[0]);
            video.onloadedmetadata = function () { video.currentTime = 1; };

            video.onseeked = await function () {
              // Create a canvas element to draw the video frame
              var canvas = document.createElement('canvas');
              canvas.width = video.videoWidth; canvas.height = video.videoHeight;

              // Draw the video frame onto the canvas
              var context: any = canvas.getContext('2d');
              context.drawImage(video, 0, 0, canvas.width, canvas.height);

              // Convert the canvas image to a data URL
              videoObj.videoThumbnail = canvas.toDataURL();
              resolve(videoObj);

              // Clean up the temporary video and canvas elements
              video.remove(); canvas.remove();
            };

          } else { resolve({}); }
        }
      } else { self.showToast('warning', 'Only video files are acceptable!'); resolve({}); }
    });
  }
  // This function use for validate video size.
  validateVideoSize(file: any) {
    if (file?.size) {
      var videoSize = file.size / 1024 / 1024;
      if (videoSize > 400) { this.showToast('warning', 'File size should be less or equal to 400MB'); return false; }
    }
    return true;
  }
  // This function use for validate video length.
  validateVideoLength(file: any) {
    var self = this;
    return new Promise((resolve, reject) => {
      var video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        if (!video.duration || video.duration < 3) {
          self.showToast('warning', 'Video length should be greater or equal to 3 seconds');
        }
        resolve(video.duration)
      }
      video.src = URL.createObjectURL(file);
    })
  }
  // This function use for validate video file extensions which we are using.
  isVideoFile(fileName: string) {
    fileName = fileName?.toLowerCase() || '';
    return this.videoExtensionsList.some((el: any) => fileName?.toLowerCase().endsWith(el));
  }
  // This function validate image size
  validateImageSize(file: File): boolean {
    if (file.size > this.MAX_FILE_SIZE) {
      this.showToast('danger', 'File size exceeds 5MB');
      return false;
    }
    return true;
  }
  // This function use for copy data.
  copyToClipboard = (subject: any, text: any) => {
    navigator.clipboard.writeText(text);
    this.showToast('success', subject);
  };
}
