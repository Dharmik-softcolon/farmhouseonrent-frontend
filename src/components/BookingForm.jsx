import { useState } from 'react';
import useLanguage from '../hooks/useLanguage';
import { bookingAPI } from '../services/api';
import WhatsAppButton from './WhatsAppButton';
import toast from 'react-hot-toast';
import { FiSend, FiUser, FiPhone, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const BookingForm = ({ farmhouse, onSubmitted }) => {
    const { t } = useLanguage();
    const [form, setForm] = useState({
        name: '',
        mobileNumber: '',
        preferredDate: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) errs.mobileNumber = 'Enter valid 10-digit mobile';
        if (!form.preferredDate) errs.preferredDate = 'Select a date';
        else if (new Date(form.preferredDate) < new Date().setHours(0,0,0,0)) errs.preferredDate = 'Date cannot be in the past';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await bookingAPI.create({
                farmhouseId: farmhouse._id,
                ...form
            });
            setSubmitted(true);
            toast.success(t('booking_success'));
            // ------------------------------------- watsapp start

            // Construct WhatsApp message and redirect
            const buildMessage = () => {
                let msg = `Hi! I'm interested in booking *${farmhouse.title}*.`;
                msg += `\n\nName: ${form.name}`;
                msg += `\nMobile: ${form.mobileNumber}`;
                msg += `\nPreferred Date: ${form.preferredDate}`;
                if (form.message.trim()) msg += `\nMessage: ${form.message.trim()}`;
                msg += `\n\nPlease share availability and pricing details. Thank you!`;
                return encodeURIComponent(msg);
            };

            const whatsappUrl = `https://wa.me/91${farmhouse.contactNumber}?text=${buildMessage()}`;
            
            // Redirect after a short delay so the toast/success screen is seen
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 1000);

            // -------------------------------------watsapp end
            // Notify parent so it can unlock the review section
            if (onSubmitted) onSubmitted();
        } catch (err) {
            toast.error(err.response?.data?.message || t('common_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({ name: '', mobileNumber: '', preferredDate: '', message: '' });
        setSubmitted(false);
        setErrors({});
    };

    if (submitted) {
        return (
            <div className="bg-green-50 rounded-2xl p-6 text-center animate-fade-in border border-green-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">{t('booking_success')}</h3>
                <p className="text-green-700 text-sm mb-6">{t('booking_success_msg')}</p>

                <WhatsAppButton
                    contactNumber={farmhouse.contactNumber}
                    farmhouseTitle={farmhouse.title}
                    userName={form.name}
                    preferredDate={form.preferredDate}
                />

                <button
                    onClick={handleReset}
                    className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                >
                    {t('booking_another')}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiSend className="w-5 h-5 text-primary-600" />
                {t('booking_title')}
            </h3>

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiUser className="w-3 h-3 inline mr-1" />
                    {t('booking_name')} *
                </label>
                <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={t('booking_name_placeholder')}
                    className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Mobile */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiPhone className="w-3 h-3 inline mr-1" />
                    {t('booking_mobile')} *
                </label>
                <input
                    type="tel"
                    value={form.mobileNumber}
                    onChange={e => setForm({ ...form, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder={t('booking_mobile_placeholder')}
                    className={`input-field ${errors.mobileNumber ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiCalendar className="w-3 h-3 inline mr-1" />
                    {t('booking_date')} *
                </label>
                <input
                    type="date"
                    value={form.preferredDate}
                    onChange={e => setForm({ ...form, preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`input-field ${errors.preferredDate ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>}
            </div>

            {/* Message */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiMessageSquare className="w-3 h-3 inline mr-1" />
                    {t('booking_message')}
                </label>
                <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder={t('booking_message_placeholder')}
                    rows={3}
                    className="input-field resize-none"
                    maxLength={500}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('booking_submitting')}
                    </>
                ) : (
                    <>
                        <FiSend className="w-4 h-4" />
                        {t('booking_submit')}
                    </>
                )}
            </button>
        </form>
    );
};

export default BookingForm;