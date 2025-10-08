import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private s3BucketName = 'bodyf1rst-workout-video-storage';
  private s3Region = 'us-east-1';
  private apiUrl = environment.apiUrl || 'https://api.bodyf1rst.net';

  constructor(private http: HttpClient) {}

  /**
   * Get all videos from a specific category
   */
  getVideosByCategory(category: string): Observable<VideoMetadata[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    });

    return this.http.get<any>(
      `${this.apiUrl}/get-videos.php`,
      { headers }
    ).pipe(
      map(response => {
        // PHP API returns wrapped object: {status: 'success', videos: [...]}
        if (response.status === 'success' && response.videos) {
          return response.videos
            .filter((v: any) => category === 'all' || v.category?.toLowerCase() === category.toLowerCase())
            .map((video: any) => this.mapToVideoMetadata(video));
        }
        return [];
      })
    );
  }

  /**
   * Map API response to VideoMetadata format
   * 🔧 FIXED: Handles both snake_case (old API) and camelCase (new API) for backward compatibility
   */
  private mapToVideoMetadata(video: any): VideoMetadata {
    // Parse tags - they come from DB as JSON string or pipe-separated
    let parsedTags: string[] = [];
    if (video.tags) {
      if (Array.isArray(video.tags)) {
        parsedTags = video.tags;
      } else if (typeof video.tags === 'string') {
        try {
          // Try parsing as JSON first
          parsedTags = JSON.parse(video.tags);
        } catch (e) {
          // If not JSON, try pipe-separated
          parsedTags = video.tags.split('|').filter((t: string) => t.trim());
        }
      }
    }

    // Get correct thumbnail URL with fallbacks
    // PHP API returns thumbnail_url (snake_case) OR thumbnailUrl (camelCase)
    const baseUrl = 'https://bodyf1rst-workout-video-storage.s3.amazonaws.com/thumbnails/';
    const cleanTitle = (video.video_title || '').replace(/\.(mp4|mov)$/i, '');
    const encodedTitle = encodeURIComponent(cleanTitle);

    // 🔧 FIXED: Try camelCase first (new API), then snake_case (old API) for backward compatibility
    const thumbnailUrl = video.thumbnailUrl || video.thumbnail_url;
    const videoUrl = video.videoUrl || video.video_url;

    // Store fallback patterns for client-side retry (in order of likelihood)
    const thumbnailFallbacks = [
      `${baseUrl}${encodedTitle}.jpg`,                               // Pattern 1: "Title.jpg"
      `${baseUrl}${encodeURIComponent(cleanTitle + cleanTitle)}.0000000.jpg`, // Pattern 2: "TitleTitle.0000000.jpg"
      `${baseUrl}${encodeURIComponent(cleanTitle + cleanTitle)}.jpg` // Pattern 3: "TitleTitle.jpg"
    ];

    return {
      id: video.id?.toString() || video.video_id?.toString() || Math.random().toString(),
      title: video.video_title || video.title || 'Untitled',
      description: video.description || '',
      category: (video.category?.toLowerCase() || 'workout') as 'workout' | 'nutrition' | 'mindset' | 'notification',
      tags: parsedTags,
      transcription: video.transcription || '',
      duration: this.parseDuration(video.duration),
      thumbnailUrl: thumbnailUrl || thumbnailFallbacks[0],
      videoUrl: videoUrl,
      s3Key: video.s3_key || video.video_title || '',
      uploadedAt: video.created_at ? new Date(video.created_at) : new Date(),
      uploadedBy: video.uploaded_by || 'Admin',
      thumbnailFallbacks: thumbnailFallbacks.slice(1) // Pass remaining fallbacks
    } as any;
  }

  /**
   * Construct correct thumbnail URL from video title
   * Thumbnails are stored in S3 at: thumbnails/[VideoName][VideoName].0000000.jpg
   * This matches the PHP API pattern
   */
  private getCorrectThumbnailUrl(videoTitle: string): string {
    if (!videoTitle) return '';

    // Remove .mp4 or .mov extension if present
    const cleanTitle = videoTitle.replace(/\.(mp4|mov)$/i, '');

    // Construct correct S3 thumbnail path - matches PHP API pattern
    // Format: thumbnails/TitleTitle.0000000.jpg (title repeated twice)
    return `https://bodyf1rst-workout-video-storage.s3.amazonaws.com/thumbnails/${encodeURIComponent(cleanTitle + cleanTitle)}.0000000.jpg`;
  }

  /**
   * Parse duration from string format (e.g., "1:30") to seconds
   */
  private parseDuration(duration: any): number {
    if (typeof duration === 'number') return duration;
    if (typeof duration === 'string') {
      const parts = duration.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }
    return 0;
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
