export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string | null;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

export interface UploadConfig {
  maxSize?: number;
  allowedTypes?: string[];
  uploadPath?: string;
  generateThumbnail?: boolean;
}

export interface UploadResponse {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

class UploadService {
  private baseUrl: string;
  private defaultConfig: UploadConfig;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_UPLOAD_URL || '/api/upload';
    this.defaultConfig = {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'video/*', 'application/pdf'],
      uploadPath: 'uploads',
      generateThumbnail: true,
    };
  }

  /**
   * Upload a single file
   */
  async uploadFile(file: File, config?: Partial<UploadConfig>): Promise<UploadedFile> {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Validate file
    this.validateFile(file, finalConfig);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(finalConfig));

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: UploadResponse = await response.json();

      if (!data.success || !data.file) {
        throw new Error(data.error || 'Upload failed');
      }

      return data.file;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], config?: Partial<UploadConfig>): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, config));
    
    // Wait for all uploads to complete (some may fail)
    const results = await Promise.allSettled(uploadPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Create error file entry
        const file = files[index];
        return {
          id: Date.now() + Math.random().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: '',
          uploadedAt: new Date(),
          status: 'error' as const,
          error: result.reason?.message || 'Upload failed',
        };
      }
    });
  }

  /**
   * Delete a file
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fileUrl }),
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(fileUrl: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/info?url=${encodeURIComponent(fileUrl)}`);
      return await response.json();
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }

  /**
   * Generate thumbnail for an image
   */
  async generateThumbnail(fileUrl: string, options?: { width?: number; height?: number }): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/thumbnail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrl,
          ...options,
        }),
      });

      const data = await response.json();
      return data.thumbnailUrl || null;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return null;
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, config: UploadConfig): void {
    // Check file size
    if (config.maxSize && file.size > config.maxSize) {
      throw new Error(`Dosya boyutu ${this.formatFileSize(config.maxSize)} limitini aşıyor`);
    }

    // Check file type
    if (config.allowedTypes && config.allowedTypes.length > 0) {
      const isAllowed = config.allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        throw new Error(`Desteklenmeyen dosya türü: ${file.type}`);
      }
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get upload presets for common use cases
   */
  getPresets() {
    return {
      image: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        generateThumbnail: true,
      },
      avatar: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        generateThumbnail: true,
      },
      document: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        generateThumbnail: false,
      },
      video: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
        generateThumbnail: true,
      },
    };
  }
}

// Export singleton instance
export const uploadService = new UploadService();

// Export utility functions
export const createUploadHandler = (config?: Partial<UploadConfig>) => {
  return (file: File) => uploadService.uploadFile(file, config);
};

export const createMultiUploadHandler = (config?: Partial<UploadConfig>) => {
  return (files: File[]) => uploadService.uploadFiles(files, config);
};
