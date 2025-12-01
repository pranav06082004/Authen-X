import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Video, FileWarning } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface MediaUploadProps {
  onMediaUploaded: (urls: string[]) => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  uploading: boolean;
  progress: number;
  url?: string;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export const MediaUpload = ({ onMediaUploaded }: MediaUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return { valid: false, error: 'Invalid file type. Only JPG, PNG, WebP, MP4, and WebM are allowed.' };
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: 'Image size must be under 10MB' };
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: 'Video size must be under 50MB' };
    }

    return { valid: true };
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);

      if (!validation.valid) {
        toast.error(validation.error!);
        continue;
      }

      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const preview = URL.createObjectURL(file);

      newFiles.push({
        file,
        preview,
        type: isImage ? 'image' : 'video',
        uploading: false,
        progress: 0,
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const uploadFile = async (fileIndex: number) => {
    const fileData = files[fileIndex];
    if (!fileData || fileData.uploading) return;

    try {
      setFiles(prev => prev.map((f, i) => i === fileIndex ? { ...f, uploading: true, progress: 0 } : f));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload files');
        return;
      }

      const fileExt = fileData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map((f, i) => {
          if (i === fileIndex && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 200);

      const { data, error } = await supabase.storage
        .from('analysis-media')
        .upload(fileName, fileData.file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload file');
        setFiles(prev => prev.filter((_, i) => i !== fileIndex));
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('analysis-media')
        .getPublicUrl(data.path);

      setFiles(prev => prev.map((f, i) => i === fileIndex ? { ...f, uploading: false, progress: 100, url: publicUrl } : f));
      toast.success('File uploaded successfully');

      // Notify parent component
      onMediaUploaded([publicUrl]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const removeFile = (index: number) => {
    const file = files[index];
    URL.revokeObjectURL(file.preview);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50'}
        `}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Support for images and videos
        </p>
        
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Images: JPG, PNG, WebP (max 10MB)</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Videos: MP4, WebM (max 50MB)</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Uploaded Files Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative glass-card rounded-lg overflow-hidden group">
              {/* Preview */}
              <div className="aspect-video bg-muted relative">
                {file.type === 'image' ? (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={file.preview}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Upload Overlay */}
                {file.uploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="text-center w-full px-4">
                      <Progress value={file.progress} className="mb-2" />
                      <p className="text-xs text-muted-foreground">{file.progress}%</p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {file.type === 'image' ? (
                      <ImageIcon className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <Video className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    <span className="text-xs truncate">{file.file.name}</span>
                  </div>
                  {!file.url && !file.uploading && (
                    <button
                      onClick={() => uploadFile(index)}
                      className="text-xs text-primary hover:underline whitespace-nowrap ml-2"
                    >
                      Upload
                    </button>
                  )}
                  {file.url && (
                    <span className="text-xs text-success whitespace-nowrap ml-2">✓ Uploaded</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && files.some(f => !f.url && !f.uploading) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 glass-card rounded-lg">
          <FileWarning className="h-4 w-4" />
          <span>Click "Upload" on each file to upload to storage</span>
        </div>
      )}
    </div>
  );
};