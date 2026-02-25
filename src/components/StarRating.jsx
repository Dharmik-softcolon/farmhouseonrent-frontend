import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

// Display-only star rating
export const StarDisplay = ({ rating = 0, size = 'sm', showNumber = true, totalReviews = null }) => {
    const sizeMap = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const textSize = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.25 && rating % 1 <= 0.75;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
        stars.push(<FaStar key={`full-${i}`} className={`${sizeMap[size]} text-yellow-400`} />);
    }
    if (hasHalf) {
        stars.push(<FaStarHalfAlt key="half" className={`${sizeMap[size]} text-yellow-400`} />);
    }
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<FiStar key={`empty-${i}`} className={`${sizeMap[size]} text-yellow-400`} />);
    }

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">{stars}</div>
            {showNumber && (
                <span className={`${textSize[size]} font-semibold text-gray-700 ml-0.5`}>
          {rating > 0 ? rating.toFixed(1) : '0'}
        </span>
            )}
            {totalReviews !== null && (
                <span className={`${textSize[size]} text-gray-500`}>
          ({totalReviews})
        </span>
            )}
        </div>
    );
};

// Interactive star rating input
export const StarInput = ({ rating, setRating, size = 'lg' }) => {
    const [hover, setHover] = useState(0);

    const sizeMap = {
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10',
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    {star <= (hover || rating) ? (
                        <FaStar className={`${sizeMap[size]} text-yellow-400 drop-shadow-sm`} />
                    ) : (
                        <FiStar className={`${sizeMap[size]} text-gray-300`} />
                    )}
                </button>
            ))}
            {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-600">
          {rating === 1 && '😞 Poor'}
                    {rating === 2 && '😐 Fair'}
                    {rating === 3 && '🙂 Good'}
                    {rating === 4 && '😊 Very Good'}
                    {rating === 5 && '🤩 Excellent'}
        </span>
            )}
        </div>
    );
};