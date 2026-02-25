import { FaWhatsapp } from 'react-icons/fa';
import useLanguage from '../hooks/useLanguage';

const WhatsAppButton = ({ contactNumber, farmhouseTitle, userName = '', preferredDate = '' }) => {
    const { t } = useLanguage();

    const buildMessage = () => {
        let msg = `Hi! I'm interested in booking *${farmhouseTitle}*.`;
        if (userName) msg += `\n\nName: ${userName}`;
        if (preferredDate) msg += `\nPreferred Date: ${preferredDate}`;
        msg += `\n\nPlease share availability and pricing details. Thank you!`;
        return encodeURIComponent(msg);
    };

    const whatsappLink = `https://wa.me/91${contactNumber}?text=${buildMessage()}`;

    return (
        <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white
                 font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
            <FaWhatsapp className="w-5 h-5" />
            {t('booking_whatsapp')}
        </a>
    );
};

export default WhatsAppButton;