import { useState, useEffect } from 'react';
import useLanguage from '../../hooks/useLanguage';
import { bookingAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { FiUsers, FiPhone, FiTrash2, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const BookingLeads = () => {
    const { t } = useLanguage();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadBookings(page);
    }, [page]);

    const loadBookings = async (pageNum) => {
        setLoading(true);
        try {
            const res = await bookingAPI.getAll({ page: pageNum, limit: 20 });
            setBookings(res.data.data || []);
            setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this booking lead?')) return;
        try {
            await bookingAPI.delete(id);
            toast.success('Booking lead deleted');
            loadBookings(page);
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const buildWhatsAppLink = (booking) => {
        const farmTitle = booking.farmhouseId?.title || 'Farmhouse';
        const msg = encodeURIComponent(
            `Hi ${booking.name}! Regarding your inquiry for *${farmTitle}* on ${new Date(booking.preferredDate).toLocaleDateString('en-IN')}. We'd like to confirm your booking. Please let us know!`
        );
        return `https://wa.me/91${booking.mobileNumber}?text=${msg}`;
    };

    if (loading) return <Spinner text={t('common_loading')} />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
                <FiUsers className="w-6 h-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">{t('leads_title')}</h1>
                <span className="text-sm text-gray-500 ml-2">({pagination.total} total)</span>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                    <span className="text-5xl block mb-4">📋</span>
                    <h3 className="text-lg font-bold text-gray-700">{t('admin_no_bookings')}</h3>
                </div>
            ) : (
                <>
                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                        {bookings.map(b => (
                            <div key={b._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{b.name}</h3>
                                        <p className="text-sm text-gray-500">{b.farmhouseId?.title || 'N/A'}</p>
                                    </div>
                                    <button onClick={() => handleDelete(b._id)}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <FiPhone className="w-3 h-3" />
                                        {b.mobileNumber}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <FiCalendar className="w-3 h-3" />
                                        {new Date(b.preferredDate).toLocaleDateString('en-IN')}
                                    </div>
                                </div>

                                {b.message && (
                                    <div className="bg-gray-50 rounded-lg p-2 text-sm text-gray-600">
                                        <FiMessageSquare className="w-3 h-3 inline mr-1" />
                                        {b.message}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <a href={`tel:+91${b.mobileNumber}`}
                                       className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-100 transition-colors">
                                        <FiPhone className="w-3 h-3" />
                                        {t('leads_call')}
                                    </a>
                                    <a href={buildWhatsAppLink(b)} target="_blank" rel="noopener noreferrer"
                                       className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 rounded-lg py-2 text-sm font-medium hover:bg-green-100 transition-colors">
                                        <FaWhatsapp className="w-3 h-3" />
                                        {t('leads_whatsapp')}
                                    </a>
                                </div>

                                <p className="text-xs text-gray-400">{t('leads_submitted')}: {new Date(b.createdAt).toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_name')}</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_mobile')}</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_farmhouse')}</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_date')}</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_message')}</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_submitted')}</th>
                                    <th className="text-right px-5 py-3 font-semibold text-gray-600">{t('leads_actions')}</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {bookings.map(b => (
                                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-900">{b.name}</td>
                                        <td className="px-5 py-3 text-gray-600">{b.mobileNumber}</td>
                                        <td className="px-5 py-3 text-gray-600 max-w-[180px] truncate">{b.farmhouseId?.title || 'N/A'}</td>
                                        <td className="px-5 py-3 text-gray-600">{new Date(b.preferredDate).toLocaleDateString('en-IN')}</td>
                                        <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{b.message || '—'}</td>
                                        <td className="px-5 py-3 text-gray-400 text-xs">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <a href={`tel:+91${b.mobileNumber}`}
                                                   className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Call">
                                                    <FiPhone className="w-4 h-4" />
                                                </a>
                                                <a href={buildWhatsAppLink(b)} target="_blank" rel="noopener noreferrer"
                                                   className="p-2 rounded-lg text-green-500 hover:bg-green-50 transition-colors" title="WhatsApp">
                                                    <FaWhatsapp className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => handleDelete(b._id)}
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                    className="btn-secondary text-sm py-2 px-4 disabled:opacity-50">{t('common_prev')}</button>
                            <span className="text-sm text-gray-600">{t('common_page')} {page} / {pagination.pages}</span>
                            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                                    className="btn-secondary text-sm py-2 px-4 disabled:opacity-50">{t('common_next')}</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BookingLeads;