import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  category: 'workout' | 'nutrition' | 'mindset' | 'notification';
  tags: string[];
  transcription: string;
  duration: number;
  thumbnailUrl?: string;
  videoUrl: string;
  s3Key: string;
  uploadedAt: Date;
  uploadedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class S3VideoService {
  private s3BucketName = 'bodyf1rst-workout-storage';
  private s3Region = 'us-east-1';
  private apiUrl = 'https://api.bodyf1rst.com';
  
  constructor(private http: HttpClient) {}

  /**
   * Get all videos from a specific category
   */
  getVideosByCategory(category: string): Observable<VideoMetadata[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    return this.http.get<VideoMetadata[]>(
      `${this.apiUrl}/videos/category/${category}`,
      { headers }
    );
  }

  /**
   * Get presigned URL for video upload
   */
  getUploadUrl(fileName: string, fileType: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    return this.http.post(
      `${this.apiUrl}/videos/upload-url`,
      { fileName, fileType, bucket: this.s3BucketName },
      { headers }
    );
  }

  /**
   * Upload video metadata after S3 upload
   */
  saveVideoMetadata(metadata: VideoMetadata): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    return this.http.post(
      `${this.apiUrl}/videos/metadata`,
      metadata,
      { headers }
    );
  }

  /**
   * Get video with transcription
   */
  getVideoWithTranscription(videoId: string): Observable<VideoMetadata> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    return this.http.get<VideoMetadata>(
      `${this.apiUrl}/videos/${videoId}`,
      { headers }
    );
  }

  /**
   * Update video transcription
   */
  updateTranscription(videoId: string, transcription: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    return this.http.put(
      `${this.apiUrl}/videos/${videoId}/transcription`,
      { transcription },
      { headers }
    );
  }

  /**
   * Update video tags
   */
  updateVideoTags(videoId: string, tags: string[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    return this.http.put(
      `${this.apiUrl}/videos/${videoId}/tags`,
      { tags },
      { headers }
    );
  }

  /**
   * Search videos by tags
   */
  searchVideosByTags(tags: string[]): Observable<VideoMetadata[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    const params = tags.join(',');
    return this.http.get<VideoMetadata[]>(
      `${this.apiUrl}/videos/search?tags=${params}`,
      { headers }
    );
  }

  /**
   * Delete video
   */
  deleteVideo(videoId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    return this.http.delete(
      `${this.apiUrl}/videos/${videoId}`,
      { headers }
    );
  }

  /**
   * Get S3 video URL (for direct access)
   */
  getS3VideoUrl(s3Key: string): string {
    return `https://${this.s3BucketName}.s3.${this.s3Region}.amazonaws.com/${s3Key}`;
  }

  /**
   * Generate video thumbnail
   */
  generateThumbnail(videoId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });
    
    return this.http.post(
      `${this.apiUrl}/videos/${videoId}/thumbnail`,
      {},
      { headers }
    );
  }
}