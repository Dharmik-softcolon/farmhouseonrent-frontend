import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useLanguage from '../hooks/useLanguage';
import { farmhouseAPI } from '../services/api';
import FarmhouseCard from '../components/FarmhouseCard';
import FilterBar from '../components/FilterBar';
import Spinner from '../components/Spinner';
import { FiGrid, FiHome, FiChevronRight } from 'react-icons/fi';

const SITE_URL = 'https://farmhouseonrent.in';

const buildSeoMeta = (filters, total, searchTerm) => {
    const city = filters.city;
    const guests = filters.guests;

    let titleParts = ['Farmhouses on Rent'];
    let descParts = [];

    if (searchTerm) {
        titleParts = [`"${searchTerm}" Farmhouses`];
        descParts.push(`Search results for "${searchTerm}"`);
    }

    if (city) {
        titleParts.push(`in ${city}`);
        descParts.push(`farmhouses on rent in ${city}`);
    } else {
        descParts.push('farmhouses on rent in Surat and Gujarat');
    }

    if (guests) {
        descParts.push(`for up to ${guests} guests`);
    }

    const title = `${titleParts.join(' ')} | FarmHouseOnRent`;
    const description = `Browse ${total > 0 ? total + '+' : ''} verified ${descParts.join(', ')}. Book premium farmhouses for parties, weekend stays & events. Instant WhatsApp booking.`;

    return { title, description };
};

const buildCanonicalUrl = (filters, searchTerm) => {
    const params = new URLSearchParams();
    if (filters.city) params.set('city', filters.city);
    if (filters.subLocation) params.set('subLocation', filters.subLocation);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (searchTerm) params.set('search', searchTerm);
    const qs = params.toString();
    return `${SITE_URL}/farmhouses${qs ? `?${qs}` : ''}`;
};

const SearchResults = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const [farmhouses, setFarmhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        subLocation: searchParams.get('subLocation') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        guests: searchParams.get('guests') || '',
        sort: searchParams.get('sort') || 'newest',
        facilities: searchParams.get('facilities') || '',
    });

    const page = parseInt(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';

    const fetchFarmhouses = async (pageNum = 1, overrideFilters) => {
        setLoading(true);
        const active = overrideFilters || filters;
        try {
            const params = { page: pageNum, limit: 12 };
            if (active.city) params.city = active.city;
            if (active.subLocation) params.subLocation = active.subLocation;
            if (active.minPrice) params.minPrice = active.minPrice;
            if (active.maxPrice) params.maxPrice = active.maxPrice;
            if (active.guests) params.maxGuests = active.guests;
            if (active.sort) params.sort = active.sort;
            if (active.facilities) params.facilities = active.facilities;
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
    }, [page, searchTerm]);

    const handleApplyFilters = (merged) => {
        const active = merged || filters;
        const params = new URLSearchParams();
        Object.entries(active).forEach(([key, val]) => {
            if (val) params.set(key, val);
        });
        if (searchTerm) params.set('search', searchTerm);
        params.set('page', '1');
        setSearchParams(params);
        fetchFarmhouses(1, active);
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ─── Dynamic SEO ───
    const { title: seoTitle, description: seoDescription } = buildSeoMeta(
        filters, pagination.total, searchTerm
    );
    const canonicalUrl = buildCanonicalUrl(filters, searchTerm);

    // ─── JSON-LD: ItemList ───
    const itemListSchema = farmhouses.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": seoTitle,
        "description": seoDescription,
        "url": canonicalUrl,
        "numberOfItems": pagination.total,
        "itemListElement": farmhouses.slice(0, 10).map((fh, index) => ({
            "@type": "ListItem",
            "position": ((page - 1) * 12) + index + 1,
            "url": `${SITE_URL}/farmhouse/${fh._id}`,
            "name": fh.title,
            "description": fh.description?.substring(0, 100) ||
                `Farmhouse on rent in ${fh.location?.city}`
        }))
    } : null;

    // ─── JSON-LD: BreadcrumbList ───
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": SITE_URL
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": filters.city
                    ? `Farmhouses in ${filters.city}`
                    : "All Farmhouses",
                "item": canonicalUrl
            }
        ]
    };

    return (
        <>
            {/* ═══════════════════════════════════════
                SEO HELMET
            ═══════════════════════════════════════ */}
            <Helmet>
                {/* ── Primary ── */}
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta
                    name="keywords"
                    content={`farmhouse on rent ${filters.city || 'surat'}, farmhouse booking ${filters.city || 'gujarat'}, party farmhouse ${filters.city || 'surat'}, weekend farmhouse gujarat, farmhouse rental ${filters.city || 'surat'}`}
                />
                {/* noindex paginated pages beyond page 1 */}
                <meta
                    name="robots"
                    content={page > 1 ? 'noindex, follow' : 'index, follow'}
                />

                {/* ── Canonical ── */}
                <link rel="canonical" href={canonicalUrl} />

                {/* ── Pagination links for Google ── */}
                {page > 1 && (
                    <link
                        rel="prev"
                        href={`${canonicalUrl}${canonicalUrl.includes('?') ? '&' : '?'}page=${page - 1}`}
                    />
                )}
                {page < pagination.pages && (
                    <link
                        rel="next"
                        href={`${canonicalUrl}${canonicalUrl.includes('?') ? '&' : '?'}page=${page + 1}`}
                    />
                )}

                {/* ── hreflang ── */}
                <link rel="alternate" hreflang="en-in" href={canonicalUrl} />
                <link rel="alternate" hreflang="hi-in" href={canonicalUrl} />
                <link rel="alternate" hreflang="gu-in" href={canonicalUrl} />
                <link rel="alternate" hreflang="x-default" href={canonicalUrl} />

                {/* ── Open Graph ── */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
                <meta
                    property="og:image:alt"
                    content={`Farmhouses on rent in ${filters.city || 'Surat Gujarat'}`}
                />
                <meta property="og:locale" content="en_IN" />
                <meta property="og:site_name" content="FarmHouseOnRent" />

                {/* ── Twitter ── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />

                {/* ── Structured Data ── */}
                {itemListSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(itemListSchema)}
                    </script>
                )}
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">

                {/* ═══ BREADCRUMB (Visual) ═══ */}
                <nav aria-label="Breadcrumb" className="mb-4">
                    <ol className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
                        <li>
                            <a href="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                                <FiHome className="w-3.5 h-3.5" />
                                <span>Home</span>
                            </a>
                        </li>
                        <li><FiChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                        <li>
                            <span className="text-gray-900 font-medium">
                                {filters.city
                                    ? `Farmhouses in ${filters.city}`
                                    : 'All Farmhouses'}
                            </span>
                        </li>
                        {searchTerm && (
                            <>
                                <li><FiChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                                <li>
                                    <span className="text-gray-700">"{searchTerm}"</span>
                                </li>
                            </>
                        )}
                    </ol>
                </nav>

                {/* ═══ HEADER ═══ */}
                <div className="flex items-center gap-2 mb-6">
                    <FiGrid className="w-6 h-6 text-primary-600" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        {filters.city
                            ? `Farmhouses in ${filters.city}`
                            : t('nav_farmhouses')}
                    </h1>
                    {!loading && (
                        <span className="text-sm text-gray-500 ml-2">
                            ({pagination.total} {t('common_results')})
                        </span>
                    )}
                </div>

                {/* ═══ FILTERS ═══ */}
                <div className="mb-6">
                    <FilterBar
                        filters={filters}
                        setFilters={setFilters}
                        onApply={handleApplyFilters}
                    />
                </div>

                {/* ═══ RESULTS ═══ */}
                {loading ? (
                    <Spinner text={t('common_loading')} />
                ) : farmhouses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl">
                        <span className="text-5xl block mb-4">🔍</span>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">
                            {t('common_no_results')}
                        </h2>
                        <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {farmhouses.map(fh => (
                                <FarmhouseCard key={fh._id} farmhouse={fh} />
                            ))}
                        </div>

                        {/* ═══ PAGINATION ═══ */}
                        {pagination.pages > 1 && (
                            <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    aria-label="Previous page"
                                    className="btn-secondary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common_prev')}
                                </button>

                                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                    .filter(p =>
                                        Math.abs(p - pagination.page) <= 2 ||
                                        p === 1 ||
                                        p === pagination.pages
                                    )
                                    .map((p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) {
                                            return (
                                                <span key={`dots-${p}`} className="px-2 text-gray-400">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => handlePageChange(p)}
                                                aria-label={`Page ${p}`}
                                                aria-current={p === pagination.page ? 'page' : undefined}
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
                                    aria-label="Next page"
                                    className="btn-secondary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common_next')}
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default SearchResults;