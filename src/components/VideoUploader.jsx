import { useState, useRef, useCallback } from 'react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiX, FiVideo, FiLoader, FiPlay } from 'react-icons/fi';

const VideoUploader = ({ videos = [], setVideos, maxFiles = 3 }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = useCallback(async (fileList) => {
        const files = Array.from(fileList);
        const remaining = maxFiles - videos.length;

        if (remaining <= 0) {
            toast.error(`Maximum ${maxFiles} videos allowed`);
            return;
        }

        const validFiles = files.slice(0, remaining).filter((file) => {
            if (!['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo'].includes(file.type)) {
                toast.error(`${file.name}: Invalid format. Use MP4, WebM, MOV, AVI`);
                return false;
            }
            if (file.size > 100 * 1024 * 1024) {
                toast.error(`${file.name}: Too large. Max 100MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            validFiles.forEach((file) => formData.append('videos', file));
            formData.append('folder', 'farmhouses/videos');

            const res = await uploadAPI.videos(formData, (pct) => setProgress(pct));
            const newUrls = res.data.data.map((item) => item.url);
            setVideos((prev) => [...prev, ...newUrls]);
            toast.success(`${newUrls.length} video(s) uploaded`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Video upload failed');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [videos, maxFiles, setVideos]);

    const removeVideo = async (index) => {
        const url = videos[index];
        setVideos((prev) => prev.filter((_, i) => i !== index));
        if (url.includes('amazonaws.com')) {
            uploadAPI.deleteFile(url).catch(() => {});
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                <FiVideo className="w-3 h-3 inline mr-1" />
                Videos ({videos.length}/{maxFiles}) — Optional
            </label>

            {videos.length < maxFiles && (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
            ${uploading ? 'pointer-events-none opacity-70' : ''}`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/mpeg,video/quicktime,video/webm,video/x-msvideo"
                        multiple
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="space-y-2">
                            <FiLoader className="w-7 h-7 text-primary-600 mx-auto animate-spin" />
                            <p className="text-sm text-gray-600">Uploading video... {progress}%</p>
                            <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <FiVideo className={`w-8 h-8 mx-auto ${dragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                            <p className="text-sm font-medium text-gray-700">
                                {dragActive ? 'Drop videos here' : 'Click or drag videos here'}
                            </p>
                            <p className="text-xs text-gray-400">MP4, WebM, MOV, AVI • Max 100MB each</p>
                        </div>
                    )}
                </div>
            )}

            {/* Video Previews */}
            {videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {videos.map((url, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-gray-200 bg-black">
                            <video
                                src={url}
                                className="w-full h-40 object-cover"
                                preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <FiPlay className="w-8 h-8 text-white" />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeVideo(idx)}
                                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full
                         flex items-center justify-center opacity-0 group-hover:opacity-100
                         transition-opacity shadow-md hover:bg-red-600"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md">
                                Video {idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VideoUploader;