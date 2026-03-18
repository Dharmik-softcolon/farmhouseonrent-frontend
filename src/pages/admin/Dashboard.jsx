import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { farmhouseAPI, bookingAPI, reviewAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import {
    FiHome, FiUsers, FiPlusCircle, FiEdit, FiTrash2,
    FiEye, FiGrid, FiStar, FiUploadCloud
} from 'react-icons/fi';

const Dashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [farmhouses, setFarmhouses] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalFH: 0, totalBookings: 0, totalReviews: 0 });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [fhRes, bookRes, reviewRes] = await Promise.all([
                farmhouseAPI.getAdminAll({ limit: 100 }),
                bookingAPI.getAll({ limit: 5 }),
                reviewAPI.getAll({ limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } }))
            ]);
            setFarmhouses(fhRes.data.data || []);
            setBookings(bookRes.data.data || []);
            setStats({
                totalFH: fhRes.data.pagination?.total || 0,
                totalBookings: bookRes.data.pagination?.total || 0,
                totalReviews: reviewRes.data.pagination?.total || 0
            });
        } catch (err) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`${t('admin_confirm_delete')}\n\n${title}`)) return;
        try {
            await farmhouseAPI.delete(id);
            toast.success('Farmhouse deleted');
            loadDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await farmhouseAPI.update(id, { isActive: !currentStatus });
            toast.success(`Farmhouse ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
            setFarmhouses(prev => prev.map(fh => 
                fh._id === id ? { ...fh, isActive: !currentStatus } : fh
            ));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) return <Spinner text={t('common_loading')} />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FiGrid className="w-6 h-6 text-primary-600" />
                    {t('admin_dashboard_title')}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <Link to="/admin/bulk-upload"
                        className="btn-secondary flex items-center gap-2 text-sm">
                        <FiUploadCloud className="w-4 h-4" />
                        Bulk Upload CSV
                    </Link>
                    <Link to="/admin/add-farmhouse" className="btn-primary flex items-center gap-2">
                        <FiPlusCircle className="w-4 h-4" />
                        {t('admin_add_new')}
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <FiHome className="w-8 h-8 text-primary-600 mb-2" />
                    <p className="text-3xl font-bold text-gray-900">{stats.totalFH}</p>
                    <p className="text-sm text-gray-500">{t('admin_total_farmhouses')}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <FiUsers className="w-8 h-8 text-accent-500 mb-2" />
                    <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                    <p className="text-sm text-gray-500">{t('admin_total_bookings')}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <FiEye className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-3xl font-bold text-gray-900">{farmhouses.filter(f => f.isActive).length}</p>
                    <p className="text-sm text-gray-500">{t('admin_active_listings')}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <FiStar className="w-8 h-8 text-yellow-500 mb-2" />
                    <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                    <p className="text-sm text-gray-500">{t('review_admin_total')}</p>
                    <Link to="/admin/reviews" className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block">
                        View All →
                    </Link>
                </div>
            </div>

            {/* Farmhouses Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{t('admin_manage_farmhouses')}</h2>
                </div>
                {farmhouses.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">{t('admin_no_farmhouses')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Image</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('form_title')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('filter_city')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('form_owner_contact')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Rating</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('card_weekday')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('card_weekend')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('filter_guests')}</th>
                                <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
                                <th className="text-right px-5 py-3 font-semibold text-gray-600">{t('leads_actions')}</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {farmhouses.map(fh => (
                                <tr key={fh._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3">
                                        <img
                                            src={fh.images?.[0] || 'https://via.placeholder.com/60'}
                                            alt={fh.title}
                                            className="w-14 h-10 object-cover rounded-lg"
                                        />
                                    </td>
                                    <td className="px-5 py-3">
                                        <Link to={`/farmhouse/${fh._id}`}
                                              className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                                            {fh.title}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">{fh.location?.city}</td>
                                    <td className="px-5 py-3 text-gray-600 font-medium">{fh.ownerContact || 'N/A'}</td>
                                    <td className="px-5 py-3">
                                        {fh.totalReviews > 0 ? (
                                            <span className="flex items-center gap-1 text-sm">
                          <FiStar className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium">{fh.averageRating?.toFixed(1)}</span>
                          <span className="text-gray-400 text-xs">({fh.totalReviews})</span>
                        </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">No reviews</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">₹{fh.priceWeekday?.toLocaleString('en-IN')}</td>
                                    <td className="px-5 py-3 text-gray-600">₹{fh.priceWeekend?.toLocaleString('en-IN')}</td>
                                    <td className="px-5 py-3 text-gray-600">{fh.maxGuests}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => handleToggleStatus(fh._id, fh.isActive)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                                                    fh.isActive ? 'bg-primary-600' : 'bg-gray-200'
                                                }`}
                                                role="switch"
                                                aria-checked={fh.isActive}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        fh.isActive ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => navigate(`/farmhouse/${fh._id}`)}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors" title="View">
                                                <FiEye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => navigate(`/admin/edit-farmhouse/${fh._id}`)}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
                                                <FiEdit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(fh._id, fh.title)}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">{t('admin_recent_bookings')}</h2>
                    <Link to="/admin/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All →
                    </Link>
                </div>
                {bookings.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">{t('admin_no_bookings')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_name')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_mobile')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_farmhouse')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_date')}</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">{t('leads_submitted')}</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {bookings.map(b => (
                                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-gray-900">{b.name}</td>
                                    <td className="px-5 py-3 text-gray-600">{b.mobileNumber}</td>
                                    <td className="px-5 py-3 text-gray-600">{b.farmhouseId?.title || 'N/A'}</td>
                                    <td className="px-5 py-3 text-gray-600">
                                        {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString('en-IN') : 'N/A'}
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 text-xs">
                                        {new Date(b.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;