import { Link } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import { StarDisplay } from './StarRating';
import { FiMapPin, FiUsers } from 'react-icons/fi';

const FarmhouseCard = ({ farmhouse }) => {
    const { t } = useLanguage();
    const {
        _id, title, priceWeekday, priceWeekend, location,
        images, facilities, maxGuests, averageRating, totalReviews
    } = farmhouse;

    return (
        <div className="card group cursor-pointer">
            <Link to={`/farmhouse/${_id}`}>
                {/* Image */}
                <div className="relative overflow-hidden h-52 sm:h-56">
                    <img
                        src={images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                    />
                    {/* Rating Badge */}
                    {totalReviews > 0 && (
                        <div className="absolute top-3 left-3">
              <span className="badge bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm font-semibold">
                ⭐ {averageRating?.toFixed(1)} ({totalReviews})
              </span>
                        </div>
                    )}
                    {!totalReviews && (
                        <div className="absolute top-3 left-3">
              <span className="badge bg-white/90 backdrop-blur-sm text-primary-700 shadow-sm">
                ✨ New
              </span>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium">
                        <FiMapPin className="w-3 h-3" />
                        {location?.city}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <FiUsers className="w-3 h-3" />
                            <span>{maxGuests} {t('card_guests')}</span>
                        </div>
                        {totalReviews > 0 && (
                            <StarDisplay rating={averageRating || 0} size="xs" totalReviews={totalReviews} />
                        )}
                    </div>

                    {/* Facilities Preview */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {facilities?.slice(0, 4).map((fac) => (
                            <span key={fac} className="badge bg-gray-100 text-gray-600 text-[10px]">
                {t(`facility_${fac}`)}
              </span>
                        ))}
                        {facilities?.length > 4 && (
                            <span className="badge bg-primary-50 text-primary-700 text-[10px]">
                +{facilities.length - 4}
              </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                            <span className="text-lg font-bold text-gray-900">₹{priceWeekday?.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-gray-500 ml-1">{t('card_weekday')}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-semibold text-accent-600">₹{priceWeekend?.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-gray-500 ml-1">{t('card_weekend')}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default FarmhouseCard;