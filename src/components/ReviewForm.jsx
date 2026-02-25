import { useState, useRef, useCallback } from 'react';
import useLanguage from '../hooks/useLanguage';
import { reviewAPI, uploadAPI } from '../services/api';
import { StarInput } from './StarRating';
import WhatsAppButton from './WhatsAppButton';
import toast from 'react-hot-toast';
import { FiSend, FiCamera, FiX, FiUser, FiMail, FiCalendar, FiLoader } from 'react-icons/fi';

const ReviewForm = ({ farmhouse, onReviewAdded }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        userName: '',
        userEmail: '',
        rating: 0,
        title: '',
        reviewText: '',
        visitDate: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (imageFiles.length + files.length > 5) {
            toast.error(t('review_max_images'));
            return;
        }

        const validFiles = files.filter((file) => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 10MB)`);
                return false;
            }
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error(`${file.name} is not a valid image`);
                return false;
            }
            return true;
        });

        const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
        setImageFiles((prev) => [...prev, ...validFiles]);
        setPreviews((prev) => [...prev, ...newPreviews]);

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        const errs = {};
        if (!form.userName.trim()) errs.userName = t('review_error_name');
        if (form.rating === 0) errs.rating = t('review_error_rating');
        if (!form.reviewText.trim()) errs.reviewText = t('review_error_text');
        if (form.reviewText.length > 2000) errs.reviewText = t('review_error_text_long');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setUploadProgress(0);

        try {
            // Step 1: Upload images to S3 first if any
            let uploadedImageUrls = [];
            if (imageFiles.length > 0) {
                const formData = new FormData();
                imageFiles.forEach((file) => formData.append('images', file));

                const uploadRes = await uploadAPI.reviewImages(formData, (pct) => {
                    setUploadProgress(pct);
                });
                uploadedImageUrls = uploadRes.data.data.map((item) => item.url);
            }

            // Step 2: Create review with uploaded image URLs
            const reviewPayload = {
                farmhouseId: farmhouse._id,
                userName: form.userName.trim(),
                userEmail: form.userEmail.trim(),
                rating: form.rating,
                title: form.title.trim(),
                reviewText: form.reviewText.trim(),
                visitDate: form.visitDate || undefined,
                imageUrls: JSON.stringify(uploadedImageUrls),
            };

            // Send as JSON (images already uploaded)
            await reviewAPI.create(reviewPayload);

            toast.success(t('review_success'));
            setSubmitted(true);

            // Reset
            setForm({ userName: '', userEmail: '', rating: 0, title: '', reviewText: '', visitDate: '' });
            setImageFiles([]);
            previews.forEach((p) => URL.revokeObjectURL(p));
            setPreviews([]);

            if (onReviewAdded) onReviewAdded();
        } catch (err) {
            toast.error(err.response?.data?.message || t('common_error'));
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
    };

    if (submitted) {
        return (
            <div className="bg-green-50 rounded-2xl p-6 text-center animate-fade-in border border-green-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">{t('review_success')}</h3>
                <p className="text-green-700 text-sm mb-4">Thank you for your review!</p>
                <button onClick={handleReset}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium underline">
                    Write Another Review
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-lg font-bold text-gray-900">{t('review_write_title')}</h3>

            {/* Rating */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('review_your_rating')} *</label>
                <StarInput rating={form.rating} setRating={(r) => handleChange('rating', r)} size="lg" />
                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiUser className="w-3 h-3 inline mr-1" />
                        {t('review_name')} *
                    </label>
                    <input type="text" value={form.userName} onChange={(e) => handleChange('userName', e.target.value)}
                           placeholder={t('review_name_placeholder')}
                           className={`input-field ${errors.userName ? 'border-red-400' : ''}`} maxLength={100} />
                    {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiMail className="w-3 h-3 inline mr-1" />
                        {t('review_email')}
                    </label>
                    <input type="email" value={form.userEmail} onChange={(e) => handleChange('userEmail', e.target.value)}
                           placeholder={t('review_email_placeholder')} className="input-field" />
                </div>
            </div>

            {/* Visit Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiCalendar className="w-3 h-3 inline mr-1" />
                    {t('review_visit_date')}
                </label>
                <input type="date" value={form.visitDate} onChange={(e) => handleChange('visitDate', e.target.value)}
                       max={new Date().toISOString().split('T')[0]} className="input-field" />
            </div>

            {/* Review Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('review_title')}</label>
                <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                       placeholder={t('review_title_placeholder')} className="input-field" maxLength={150} />
            </div>

            {/* Review Text */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('review_text')} *</label>
                <textarea value={form.reviewText} onChange={(e) => handleChange('reviewText', e.target.value)}
                          placeholder={t('review_text_placeholder')} rows={4}
                          className={`input-field resize-none ${errors.reviewText ? 'border-red-400' : ''}`} maxLength={2000} />
                <div className="flex justify-between mt-1">
                    {errors.reviewText && <p className="text-red-500 text-xs">{errors.reviewText}</p>}
                    <p className="text-xs text-gray-400 ml-auto">{form.reviewText.length}/2000</p>
                </div>
            </div>

            {/* ═══ IMAGE UPLOAD ═══ */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCamera className="w-3 h-3 inline mr-1" />
                    {t('review_add_photos')} ({imageFiles.length}/5)
                </label>

                {/* Preview Grid */}
                {previews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                        {previews.map((preview, idx) => (
                            <div key={idx} className="relative group">
                                <img src={preview} alt={`Preview ${idx + 1}`}
                                     className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" />
                                <button type="button" onClick={() => removeImage(idx)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                           flex items-center justify-center opacity-0 group-hover:opacity-100
                           transition-opacity shadow-md">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {imageFiles.length < 5 && (
                    <>
                        <input ref={fileInputRef} type="file"
                               accept="image/jpeg,image/jpg,image/png,image/webp"
                               multiple onChange={handleImageSelect} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300
                       rounded-xl text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600
                       transition-colors">
                            <FiCamera className="w-4 h-4" />
                            {t('review_upload_btn')}
                        </button>
                        <p className="text-xs text-gray-400 mt-1">{t('review_upload_hint')}</p>
                    </>
                )}
            </div>

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Uploading images... {uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 rounded-full transition-all"
                             style={{ width: `${uploadProgress}%` }} />
                    </div>
                </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('review_submitting')}
                    </>
                ) : (
                    <>
                        <FiSend className="w-4 h-4" />
                        {t('review_submit')}
                    </>
                )}
            </button>
        </form>
    );
};

export default ReviewForm;