import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { farmhouseAPI } from '../../services/api';
import ImageUploader from '../../components/ImageUploader';
import VideoUploader from '../../components/VideoUploader';
import toast from 'react-hot-toast';
import { FiPlusCircle, FiSave, FiX } from 'react-icons/fi';

const FACILITY_OPTIONS = [
    'pool','garden','ac','kitchen','parking','wifi','bbq','bonfire',
    'gym','spa','pet_friendly','security','power_backup','waterpark',
    'indoor_games','outdoor_games','music_system','projector','caretaker',
];

const AddFarmhouse = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        title: '', description: '', priceWeekday: '', priceWeekend: '',
        city: '', fullAddress: '', googleMapLink: '',
        maxGuests: '', contactNumber: '', facilities: [],
    });
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const toggleFacility = (fac) => {
        setForm((prev) => ({
            ...prev,
            facilities: prev.facilities.includes(fac)
                ? prev.facilities.filter((f) => f !== fac)
                : [...prev.facilities, fac],
        }));
    };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Title is required';
        if (!form.description.trim()) errs.description = 'Description is required';
        if (!form.priceWeekday || Number(form.priceWeekday) < 0) errs.priceWeekday = 'Valid price required';
        if (!form.priceWeekend || Number(form.priceWeekend) < 0) errs.priceWeekend = 'Valid price required';
        if (!form.city.trim()) errs.city = 'City is required';
        if (!form.fullAddress.trim()) errs.fullAddress = 'Address is required';
        if (images.length === 0) errs.images = 'At least one image is required';
        if (!form.maxGuests || Number(form.maxGuests) < 1) errs.maxGuests = 'At least 1 guest';
        if (!/^[6-9]\d{9}$/.test(form.contactNumber)) errs.contactNumber = 'Valid 10-digit mobile required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                priceWeekday: Number(form.priceWeekday),
                priceWeekend: Number(form.priceWeekend),
                location: {
                    city: form.city.trim(),
                    fullAddress: form.fullAddress.trim(),
                    googleMapLink: form.googleMapLink.trim(),
                },
                images,
                videos,
                facilities: form.facilities,
                maxGuests: Number(form.maxGuests),
                contactNumber: form.contactNumber.trim(),
            };

            await farmhouseAPI.create(payload);
            toast.success('Farmhouse added successfully!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add farmhouse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
                <FiPlusCircle className="w-6 h-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">{t('form_add_title')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_title')} *</label>
                    <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                           placeholder={t('form_title_placeholder')} className={`input-field ${errors.title ? 'border-red-400' : ''}`} />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_description')} *</label>
                    <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)}
                              placeholder={t('form_description_placeholder')} rows={5}
                              className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`} />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_price_weekday')} *</label>
                        <input type="number" value={form.priceWeekday} onChange={(e) => handleChange('priceWeekday', e.target.value)}
                               placeholder="5000" min="0" className={`input-field ${errors.priceWeekday ? 'border-red-400' : ''}`} />
                        {errors.priceWeekday && <p className="text-red-500 text-xs mt-1">{errors.priceWeekday}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_price_weekend')} *</label>
                        <input type="number" value={form.priceWeekend} onChange={(e) => handleChange('priceWeekend', e.target.value)}
                               placeholder="8000" min="0" className={`input-field ${errors.priceWeekend ? 'border-red-400' : ''}`} />
                        {errors.priceWeekend && <p className="text-red-500 text-xs mt-1">{errors.priceWeekend}</p>}
                    </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_city')} *</label>
                        <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)}
                               placeholder={t('form_city_placeholder')} className={`input-field ${errors.city ? 'border-red-400' : ''}`} />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_map_link')}</label>
                        <input type="text" value={form.googleMapLink} onChange={(e) => handleChange('googleMapLink', e.target.value)}
                               placeholder={t('form_map_link_placeholder')} className="input-field" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_address')} *</label>
                    <input type="text" value={form.fullAddress} onChange={(e) => handleChange('fullAddress', e.target.value)}
                           placeholder={t('form_address_placeholder')} className={`input-field ${errors.fullAddress ? 'border-red-400' : ''}`} />
                    {errors.fullAddress && <p className="text-red-500 text-xs mt-1">{errors.fullAddress}</p>}
                </div>

                {/* ═══ IMAGE UPLOAD ═══ */}
                <div>
                    <ImageUploader
                        images={images}
                        setImages={setImages}
                        maxFiles={10}
                        folder="farmhouses"
                        label={`${t('form_images')} *`}
                        isAdmin={true}
                    />
                    {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                </div>

                {/* ═══ VIDEO UPLOAD ═══ */}
                <VideoUploader
                    videos={videos}
                    setVideos={setVideos}
                    maxFiles={3}
                />

                {/* Max Guests & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_max_guests')} *</label>
                        <input type="number" value={form.maxGuests} onChange={(e) => handleChange('maxGuests', e.target.value)}
                               placeholder="20" min="1" className={`input-field ${errors.maxGuests ? 'border-red-400' : ''}`} />
                        {errors.maxGuests && <p className="text-red-500 text-xs mt-1">{errors.maxGuests}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_contact')} *</label>
                        <input type="text" value={form.contactNumber}
                               onChange={(e) => handleChange('contactNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                               placeholder={t('form_contact_placeholder')}
                               className={`input-field ${errors.contactNumber ? 'border-red-400' : ''}`} />
                        {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                    </div>
                </div>

                {/* Facilities */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('form_facilities')}</label>
                    <div className="flex flex-wrap gap-2">
                        {FACILITY_OPTIONS.map((fac) => (
                            <button
                                key={fac}
                                type="button"
                                onClick={() => toggleFacility(fac)}
                                className={`badge cursor-pointer transition-all text-xs py-1.5 px-3
                  ${form.facilities.includes(fac)
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {t(`facility_${fac}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button type="submit" disabled={loading}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50">
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {t('form_saving')}
                            </>
                        ) : (
                            <>
                                <FiSave className="w-4 h-4" />
                                {t('form_save')}
                            </>
                        )}
                    </button>
                    <button type="button" onClick={() => navigate('/admin/dashboard')}
                            className="btn-secondary flex items-center gap-2">
                        <FiX className="w-4 h-4" />
                        {t('form_cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddFarmhouse;