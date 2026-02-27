import { useState, useEffect } from 'react';
import useLanguage from '../hooks/useLanguage';
import { farmhouseAPI } from '../services/api';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

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
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        farmhouseAPI.getCities()
            .then(res => setCities(res.data.data || []))
            .catch(() => {});
    }, []);

    // Fetch sub-locations whenever city changes to Surat
    useEffect(() => {
        if (filters.city && filters.city.toLowerCase() === 'surat') {
            farmhouseAPI.getSubLocations('Surat')
                .then(res => setSubLocations(res.data.data || []))
                .catch(() => setSubLocations([]));
        } else {
            setSubLocations([]);
            // Clear subLocation filter when switching away from Surat
            if (filters.subLocation) {
                setFilters(prev => ({ ...prev, subLocation: '' }));
            }
        }
    }, [filters.city]);

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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

    const selectedFacilities = filters.facilities ? filters.facilities.split(',').filter(Boolean) : [];

    const clearAll = () => {
        setFilters({ city: '', subLocation: '', minPrice: '', maxPrice: '', guests: '', sort: 'newest', facilities: '' });
        onApply();
    };

    const isSurat = filters.city && filters.city.toLowerCase() === 'surat';
    const hasActiveFilters = filters.city || filters.subLocation || filters.minPrice || filters.maxPrice || filters.guests || filters.facilities;

    const FilterContent = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* City */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filter_city')}</label>
                    <select
                        value={filters.city}
                        onChange={e => handleChange('city', e.target.value)}
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
                            onChange={e => handleChange('subLocation', e.target.value)}
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
                        value={filters.minPrice}
                        onChange={e => handleChange('minPrice', e.target.value)}
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
                        value={filters.maxPrice}
                        onChange={e => handleChange('maxPrice', e.target.value)}
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
                        value={filters.guests}
                        onChange={e => handleChange('guests', e.target.value)}
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
                        onChange={e => handleChange('sort', e.target.value)}
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
                                className={`badge cursor-pointer transition-all text-xs py-1.5 px-3 
                  ${selectedFacilities.includes(fac)
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {t(`facility_${fac}`)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <button onClick={onApply} className="btn-primary text-sm py-2 px-5">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center gap-2 w-full text-sm font-semibold text-gray-700 mb-2"
            >
                <FiFilter className="w-4 h-4" />
                {t('filter_title')}
                {hasActiveFilters && <span className="badge bg-primary-100 text-primary-700 text-xs">Active</span>}
                <FiChevronDown className={`w-4 h-4 ml-auto transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop: always show, Mobile: toggle */}
            <div className={`${mobileOpen ? 'block' : 'hidden'} lg:block`}>
                <FilterContent />
            </div>
        </div>
    );
};

export default FilterBar;