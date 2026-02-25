import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import { farmhouseAPI } from '../services/api';
import FarmhouseCard from '../components/FarmhouseCard';
import FilterBar from '../components/FilterBar';
import Spinner from '../components/Spinner';
import { FiGrid } from 'react-icons/fi';

const SearchResults = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const [farmhouses, setFarmhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        guests: searchParams.get('guests') || '',
        sort: searchParams.get('sort') || 'newest',
        facilities: searchParams.get('facilities') || '',
    });

    const page = parseInt(searchParams.get('page')) || 1;

    const fetchFarmhouses = async (pageNum = 1) => {
        setLoading(true);
        try {
            const params = { page: pageNum, limit: 12 };
            if (filters.city) params.city = filters.city;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.guests) params.maxGuests = filters.guests;
            if (filters.sort) params.sort = filters.sort;
            if (filters.facilities) params.facilities = filters.facilities;

            const searchTerm = searchParams.get('search');
            if (searchTerm) params.search = searchTerm;

            const res = await farmhouseAPI.getAll(params);
            setFarmhouses(res.data.data || []);
            setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
        } catch (err) {
            console.error('Failed to fetch farmhouses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmhouses(page);
    }, [page, searchParams.get('search')]);

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params.set(key, val);
        });
        const search = searchParams.get('search');
        if (search) params.set('search', search);
        params.set('page', '1');
        setSearchParams(params);
        fetchFarmhouses(1);
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <FiGrid className="w-6 h-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">{t('nav_farmhouses')}</h1>
                {!loading && (
                    <span className="text-sm text-gray-500 ml-2">
            ({pagination.total} {t('common_results')})
          </span>
                )}
            </div>

            {/* Filters */}
            <div className="mb-6">
                <FilterBar filters={filters} setFilters={setFilters} onApply={handleApplyFilters} />
            </div>

            {/* Results */}
            {loading ? (
                <Spinner text={t('common_loading')} />
            ) : farmhouses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl">
                    <span className="text-5xl block mb-4">🔍</span>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">{t('common_no_results')}</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {farmhouses.map(fh => (
                            <FarmhouseCard key={fh._id} farmhouse={fh} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="btn-secondary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('common_prev')}
                            </button>

                            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                .filter(p => Math.abs(p - pagination.page) <= 2 || p === 1 || p === pagination.pages)
                                .map((p, idx, arr) => {
                                    if (idx > 0 && p - arr[idx - 1] > 1) {
                                        return (
                                            <span key={`dots-${p}`} className="px-2 text-gray-400">...</span>
                                        );
                                    }
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors
                        ${p === pagination.page
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="btn-secondary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('common_next')}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;