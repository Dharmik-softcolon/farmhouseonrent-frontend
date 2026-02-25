import { useState, useRef, useCallback } from 'react';
import { uploadAPI } from '../services/api';
import useLanguage from '../hooks/useLanguage';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiX, FiImage, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';

const ImageUploader = ({
                           images = [],
                           setImages,
                           maxFiles = 10,
                           folder = 'farmhouses',
                           label = '',
                           isAdmin = true,
                       }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = useCallback(async (fileList) => {
        const files = Array.from(fileList);
        const remaining = maxFiles - images.length;

        if (remaining <= 0) {
            toast.error(`Maximum ${maxFiles} images allowed`);
            return;
        }

        const validFiles = files.slice(0, remaining).filter((file) => {
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
                toast.error(`${file.name}: Invalid format. Use JPG, PNG, WebP, or GIF`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name}: Too large. Max 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            validFiles.forEach((file) => formData.append('images', file));
            formData.append('folder', folder);

            const uploadFn = isAdmin ? uploadAPI.images : uploadAPI.reviewImages;
            const res = await uploadFn(formData, (pct) => setProgress(pct));

            const newUrls = res.data.data.map((item) => item.url);
            setImages((prev) => [...prev, ...newUrls]);
            toast.success(`${newUrls.length} image(s) uploaded`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [images, maxFiles, folder, isAdmin, setImages]);

    const removeImage = async (index) => {
        const url = images[index];
        setImages((prev) => prev.filter((_, i) => i !== index));

        // Try to delete from S3 (non-blocking)
        if (isAdmin && url.includes('amazonaws.com')) {
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
        if (e.dataTransfer.files?.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    <FiImage className="w-3 h-3 inline mr-1" />
                    {label} ({images.length}/{maxFiles})
                </label>
            )}

            {/* Upload Area */}
            {images.length < maxFiles && (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
            ${dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                    }
            ${uploading ? 'pointer-events-none opacity-70' : ''}`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        multiple
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="space-y-3">
                            <FiLoader className="w-8 h-8 text-primary-600 mx-auto animate-spin" />
                            <p className="text-sm text-gray-600">Uploading... {progress}%</p>
                            <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <FiUploadCloud className={`w-10 h-10 mx-auto ${dragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {dragActive ? 'Drop images here' : 'Click or drag images here'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    JPG, PNG, WebP, GIF • Max 10MB each • {maxFiles - images.length} remaining
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                            <img
                                src={url}
                                alt={`Upload ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(idx);
                                }}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full
                         flex items-center justify-center opacity-0 group-hover:opacity-100
                         transition-opacity shadow-md hover:bg-red-600"
                            >
                                <FiX className="w-3 h-3" />
                            </button>
                            {/* Index Badge */}
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                                {idx + 1}
                            </div>
                            {/* First = Cover */}
                            {idx === 0 && (
                                <div className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                                    Cover
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;