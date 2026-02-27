import { useState, useEffect } from 'react';
import useLanguage from '../hooks/useLanguage';
import { farmhouseAPI } from '../services/api';
import { FiFilter, FiX, FiChevronDown, FiCheck } from 'react-icons/fi';

const FACILITY_OPTIONS = [
    'pool','garden','ac','kitchen','parking','wifi',
    'pet_friendly','security','power_backup','waterpark',
    'outdoor_games','music_system','caretaker','kids_play_area','gajebo'
];

const FilterBar = ({ filters, setFilters, onApply }) => {
    const { t } = useLanguage();
    const [cities, setCities] = useState([]);
    const [subLocations, setSubLocations] = useState([]);
    const [showFacilities, setShowFacilities] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false); // mobile bottom-sheet

    const [draft, setDraft] = useState({
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        guests:   filters.guests   || '',
    });

    useEffect(() => {
        setDraft({
            minPrice: filters.minPrice || '',
            maxPrice: filters.maxPrice || '',
            guests:   filters.guests   || '',
        });
    }, [filters.minPrice, filters.maxPrice, filters.guests]);

    useEffect(() => {
        farmhouseAPI.getCities()
            .then(res => setCities(res.data.data || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (filters.city && filters.city.toLowerCase() === 'surat') {
            farmhouseAPI.getSubLocations('Surat')
                .then(res => setSubLocations(res.data.data || []))
                .catch(() => setSubLocations([]));
        } else {
            setSubLocations([]);
            if (filters.subLocation) {
                setFilters(prev => ({ ...prev, subLocation: '' }));
            }
        }
    }, [filters.city]);

    const handleSelectChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDraftChange = (key, value) => {
        setDraft(prev => ({ ...prev, [key]: value }));
    };

    const toggleFacility = (fac) => {
        setFilters(prev => {
            const current = prev.facilities ? prev.facilities.split(',').filter(Boolean) : [];
            const updated = current.includes(fac)
                ? current.filter(f => f !== fac)
                : [...current, fac];
            return { ...prev, facilities: updated.join(',') };
        });
    };

    const handleApply = () => {
        const merged = {
            ...filters,
            minPrice: draft.minPrice,
            maxPrice: draft.maxPrice,
            guests:   draft.guests,
        };
        setFilters(merged);
        onApply(merged);
        setSheetOpen(false);
    };

    const clearAll = () => {
        setDraft({ minPrice: '', maxPrice: '', guests: '' });
        setFilters({ city: '', subLocation: '', minPrice: '', maxPrice: '', guests: '', sort: 'newest', facilities: '' });
        onApply();
        setSheetOpen(false);
    };

    const selectedFacilities = filters.facilities ? filters.facilities.split(',').filter(Boolean) : [];
    const isSurat = filters.city && filters.city.toLowerCase() === 'surat';
    const hasActiveFilters = filters.city || filters.subLocation || draft.minPrice || draft.maxPrice || draft.guests || filters.facilities;
    const activeCount = [
        filters.city, filters.subLocation, draft.minPrice, draft.maxPrice, draft.guests,
        ...selectedFacilities
    ].filter(Boolean).length;

    /* ── Filter body JSX (shared between desktop and mobile sheet) ── */
    const filterBody = (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* City */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filter_city')}</label>
                    <select
                        value={filters.city}
                        onChange={e => handleSelectChange('city', e.target.value)}
                        className="input-field text-sm py-2.5"
                    >
                        <option value="">{t('filter_all_cities')}</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                {/* Sub-location (Surat only) */}
                {isSurat && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            📍 Area in Surat
                        </label>
                        <select
                            value={filters.subLocation || ''}
                            onChange={e => handleSelectChange('subLocation', e.target.value)}
                            className="input-field text-sm py-2.5"
                        >
                            <option value="">All areas</option>
                            {subLocations.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Min Price */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filter_min_price')}</label>
                    <input
                        type="number"
                        value={draft.minPrice}
                        onChange={e => handleDraftChange('minPrice', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleApply()}
                        placeholder="₹0"
                        className="input-field text-sm py-2.5"
                        min="0"
                    />
                </div>

                {/* Max Price */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filter_max_price')}</label>
                    <input
                        type="number"
                        value={draft.maxPrice}
                        onChange={e => handleDraftChange('maxPrice', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleApply()}
                        placeholder="₹50000"
                        className="input-field text-sm py-2.5"
                        min="0"
                    />
                </div>

                {/* Guests */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filter_guests')}</label>
                    <input
                        type="number"
                        value={draft.guests}
                        onChange={e => handleDraftChange('guests', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleApply()}
                        placeholder="1"
                        className="input-field text-sm py-2.5"
                        min="1"
                    />
                </div>

                {/* Sort */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filter_sort')}</label>
                    <select
                        value={filters.sort}
                        onChange={e => handleSelectChange('sort', e.target.value)}
                        className="input-field text-sm py-2.5"
                    >
                        <option value="newest">{t('filter_sort_newest')}</option>
                        <option value="price_asc">{t('filter_sort_price_asc')}</option>
                        <option value="price_desc">{t('filter_sort_price_desc')}</option>
                        <option value="guests">{t('filter_sort_guests')}</option>
                    </select>
                </div>
            </div>

            {/* Facilities Toggle */}
            <div>
                <button
                    onClick={() => setShowFacilities(!showFacilities)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors"
                >
                    {t('filter_facilities')}
                    <FiChevronDown className={`w-4 h-4 transition-transform ${showFacilities ? 'rotate-180' : ''}`} />
                    {selectedFacilities.length > 0 && (
                        <span className="badge bg-primary-100 text-primary-700">{selectedFacilities.length}</span>
                    )}
                </button>

                {showFacilities && (
                    <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
                        {FACILITY_OPTIONS.map(fac => (
                            <button
                                key={fac}
                                onClick={() => toggleFacility(fac)}
                                className={`badge cursor-pointer transition-all text-xs py-1.5 px-3 flex items-center gap-1
                  ${selectedFacilities.includes(fac)
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {selectedFacilities.includes(fac) && <FiCheck className="w-3 h-3" />}
                                {t(`facility_${fac}`)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <button onClick={handleApply} className="btn-primary text-sm py-2 px-5">
                    {t('filter_apply')}
                </button>
                {hasActiveFilters && (
                    <button onClick={clearAll} className="btn-secondary text-sm py-2 px-5 flex items-center gap-1">
                        <FiX className="w-3 h-3" />
                        {t('filter_clear')}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* ── MOBILE: trigger button ── */}
            <div className="lg:hidden">
                <button
                    onClick={() => setSheetOpen(true)}
                    className="w-full flex items-center justify-between gap-3 bg-white border border-gray-200
                        rounded-2xl px-4 py-3.5 shadow-sm active:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${hasActiveFilters ? 'bg-primary-100' : 'bg-gray-100'}`}>
                            <FiFilter className={`w-4 h-4 ${hasActiveFilters ? 'text-primary-600' : 'text-gray-600'}`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{t('filter_title')}</span>
                        {activeCount > 0 && (
                            <span className="badge bg-primary-600 text-white text-[10px] py-0.5 px-2">
                                {activeCount} active
                            </span>
                        )}
                    </div>
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* ── MOBILE BOTTOM SHEET ── */}
            {sheetOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 animate-fade-in-backdrop"
                        onClick={() => setSheetOpen(false)}
                    />
                    {/* Sheet */}
                    <div className="relative bg-white rounded-t-3xl animate-slide-up-sheet max-h-[85vh] flex flex-col">
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <FiFilter className="w-4 h-4 text-primary-600" />
                                {t('filter_title')}
                                {activeCount > 0 && (
                                    <span className="badge bg-primary-100 text-primary-700 text-xs">{activeCount}</span>
                                )}
                            </h3>
                            <button
                                onClick={() => setSheetOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1 px-5 py-4">
                            {filterBody}
                        </div>
                    </div>
                </div>
            )}

            {/* ── DESKTOP: always visible panel ── */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {filterBody}
            </div>
        </>
    );
};

export default FilterBar;