import logo from '../assets/logo/logo farmhouse.png';

const Logo = ({ size = 'md', white = false }) => {
    const sizeMap = {
        sm: { icon: 'w-9 h-9',  text: 'text-xl',  tag: 'text-[10px]' },
        md: { icon: 'w-11 h-11', text: 'text-2xl', tag: 'text-[11px]' },
        lg: { icon: 'w-14 h-14', text: 'text-3xl', tag: 'text-xs' },
        xl: { icon: 'w-18 h-18', text: 'text-4xl', tag: 'text-sm' },
    };

    const s = sizeMap[size];

    return (
        <div className="flex items-center gap-2">
            <div className={`${s.icon} rounded-xl overflow-hidden flex items-center justify-center shadow-sm`}>
                <img
                    src={logo}
                    alt="farmhouseonrent Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<span class="text-white text-lg">🏡</span>';
                        e.target.parentNode.classList.add('bg-primary-600');
                    }}
                />
            </div>
            <div>
        <span className={`font-extrabold ${s.text} ${white ? 'text-white' : 'text-gray-900'} tracking-tight`}>
          FarmHouse<span className={`${white ? 'text-yellow-300' : 'text-primary-600'}`}>Onrent</span>
        </span>
                <span className={`block ${s.tag} ${white ? 'text-white/70' : 'text-gray-500'} -mt-1 font-medium tracking-wide`}>
          Premium Farmhouses
        </span>
            </div>
        </div>
    );
};

export default Logo;