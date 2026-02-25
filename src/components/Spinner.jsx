const Spinner = ({ size = 'lg', text = '' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6 border-2',
        md: 'h-10 w-10 border-3',
        lg: 'h-16 w-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
                className={`${sizeClasses[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
            />
            {text && <p className="text-gray-500 text-sm animate-pulse">{text}</p>}
        </div>
    );
};

export default Spinner;