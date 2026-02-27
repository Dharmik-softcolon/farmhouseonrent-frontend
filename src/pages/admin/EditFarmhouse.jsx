import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { farmhouseAPI } from '../../services/api';
import ImageUploader from '../../components/ImageUploader';
import VideoUploader from '../../components/VideoUploader';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { FiEdit, FiSave, FiX } from 'react-icons/fi';

// Simple on/off facilities
const BOOL_FACILITIES = ['ac','kitchen','parking','wifi','pet_friendly','security','power_backup','waterpark','outdoor_games','music_system','caretaker','kids_play_area','gajebo'];
// Size-selectable facilities
const SIZE_FACILITIES = ['pool','garden'];
// Quantity-based facilities
const QTY_FACILITIES = ['metres','bed','khatla','chair','zula'];

const parseFacilities = (arr = []) => {
    const bools = {};
    const sizes = {};
    const qtys = {};
    arr.forEach(f => {
        if (f.includes(':')) {
            const [key, val] = f.split(':');
            if (SIZE_FACILITIES.includes(key)) sizes[key] = val;
            else if (QTY_FACILITIES.includes(key)) qtys[key] = val;
        } else {
            bools[f] = true;
        }
    });
    return { bools, sizes, qtys };
};

const serializeFacilities = ({ bools, sizes, qtys }) => {
    const arr = [];
    Object.entries(bools).forEach(([k, v]) => { if (v) arr.push(k); });
    Object.entries(sizes).forEach(([k, v]) => { if (v) arr.push(`${k}:${v}`); });
    Object.entries(qtys).forEach(([k, v]) => { if (v && Number(v) > 0) arr.push(`${k}:${v}`); });
    return arr;
};

const EditFarmhouse = () => {
    const { id } = useParams();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [facBools, setFacBools] = useState({});
    const [facSizes, setFacSizes] = useState({});
    const [facQtys, setFacQtys] = useState({});
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadFarmhouse();
    }, [id]);

    const loadFarmhouse = async () => {
        try {
            const res = await farmhouseAPI.getById(id);
            const fh = res.data.data;
            setForm({
                title: fh.title || '',
                description: fh.description || '',
                priceWeekday: fh.priceWeekday || '',
                priceWeekend: fh.priceWeekend || '',
                city: fh.location?.city || '',
                fullAddress: fh.location?.fullAddress || '',
                googleMapLink: fh.location?.googleMapLink || '',
                maxGuests: fh.maxGuests || '',
                contactNumber: fh.contactNumber || '',
            });
            const parsed = parseFacilities(fh.facilities || []);
            setFacBools(parsed.bools);
            setFacSizes(parsed.sizes);
            setFacQtys(parsed.qtys);
            setImages(fh.images || []);
            setVideos(fh.videos || []);
        } catch (err) {
            toast.error('Failed to load farmhouse');
            navigate('/admin/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const toggleBool = (fac) => setFacBools(prev => ({ ...prev, [fac]: !prev[fac] }));
    const setSize = (fac, size) => setFacSizes(prev => ({ ...prev, [fac]: prev[fac] === size ? '' : size }));
    const setQty = (fac, val) => setFacQtys(prev => ({ ...prev, [fac]: val }));

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

        setSaving(true);
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
                facilities: serializeFacilities({ bools: facBools, sizes: facSizes, qtys: facQtys }),
                maxGuests: Number(form.maxGuests),
                contactNumber: form.contactNumber.trim(),
            };

            await farmhouseAPI.update(id, payload);
            toast.success('Farmhouse updated successfully!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) return <Spinner text={t('common_loading')} />;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
                <FiEdit className="w-6 h-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">{t('form_edit_title')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_title')} *</label>
                    <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                           className={`input-field ${errors.title ? 'border-red-400' : ''}`} />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_description')} *</label>
                    <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)}
                              rows={5} className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`} />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_price_weekday')} *</label>
                        <input type="number" value={form.priceWeekday} onChange={(e) => handleChange('priceWeekday', e.target.value)}
                               min="0" className={`input-field ${errors.priceWeekday ? 'border-red-400' : ''}`} />
                        {errors.priceWeekday && <p className="text-red-500 text-xs mt-1">{errors.priceWeekday}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_price_weekend')} *</label>
                        <input type="number" value={form.priceWeekend} onChange={(e) => handleChange('priceWeekend', e.target.value)}
                               min="0" className={`input-field ${errors.priceWeekend ? 'border-red-400' : ''}`} />
                        {errors.priceWeekend && <p className="text-red-500 text-xs mt-1">{errors.priceWeekend}</p>}
                    </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_city')} *</label>
                        <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)}
                               className={`input-field ${errors.city ? 'border-red-400' : ''}`} />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_map_link')}</label>
                        <input type="text" value={form.googleMapLink} onChange={(e) => handleChange('googleMapLink', e.target.value)}
                               className="input-field" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_address')} *</label>
                    <input type="text" value={form.fullAddress} onChange={(e) => handleChange('fullAddress', e.target.value)}
                           className={`input-field ${errors.fullAddress ? 'border-red-400' : ''}`} />
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
                               min="1" className={`input-field ${errors.maxGuests ? 'border-red-400' : ''}`} />
                        {errors.maxGuests && <p className="text-red-500 text-xs mt-1">{errors.maxGuests}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form_contact')} *</label>
                        <input type="text" value={form.contactNumber}
                               onChange={(e) => handleChange('contactNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                               className={`input-field ${errors.contactNumber ? 'border-red-400' : ''}`} />
                        {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                    </div>
                </div>

                {/* Facilities */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t('form_facilities')}</label>

                    {/* Size-selectable: Pool & Garden */}
                    <div className="mb-4 space-y-3">
                        {SIZE_FACILITIES.map(fac => (
                            <div key={fac} className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 w-28">{t(`facility_${fac}`)}:</span>
                                {['big', 'medium'].map(size => (
                                    <button key={size} type="button"
                                        onClick={() => setSize(fac, size)}
                                        className={`badge cursor-pointer transition-all text-xs py-1.5 px-3
                                        ${facSizes[fac] === size ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                        {t(`facility_size_${size}`)}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Quantity-based items */}
                    <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {QTY_FACILITIES.map(fac => (
                            <div key={fac} className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 font-medium w-20 shrink-0">{t(`facility_${fac}`)}</label>
                                <input type="number" min="0" placeholder={t('facility_qty_label')}
                                    value={facQtys[fac] || ''}
                                    onChange={e => setQty(fac, e.target.value)}
                                    className="input-field py-1 px-2 text-sm w-20" />
                            </div>
                        ))}
                    </div>

                    {/* Boolean toggles */}
                    <div className="flex flex-wrap gap-2">
                        {BOOL_FACILITIES.map(fac => (
                            <button key={fac} type="button"
                                onClick={() => toggleBool(fac)}
                                className={`badge cursor-pointer transition-all text-xs py-1.5 px-3
                                ${facBools[fac] ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {t(`facility_${fac}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button type="submit" disabled={saving}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50">
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {t('form_updating')}
                            </>
                        ) : (
                            <>
                                <FiSave className="w-4 h-4" />
                                {t('form_update')}
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

export default EditFarmhouse;