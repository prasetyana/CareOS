import React from 'react';
import { Link } from 'react-router-dom';
import { LucideProps } from 'lucide-react';

interface QuickActionButtonProps {
    to?: string;
    onClick?: () => void;
    icon: React.FC<LucideProps>;
    label: string;
    color?: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ to, onClick, icon: Icon, label, color = "text-blue-600" }) => {
    const content = (
        <>
            {/* Icon Container: White Squircle with Shadow */}
            <div className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] bg-white dark:bg-neutral-800 rounded-[16px] sm:rounded-[18px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-neutral-100 dark:border-neutral-700 group-hover:shadow-md group-active:scale-95 transition-all duration-200 ease-out">
                <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${color}`} strokeWidth={2} />
            </div>

            {/* Text Label: Outside, minimal, centered */}
            <span className="text-[11px] sm:text-[12px] font-medium tracking-wide text-neutral-600 dark:text-neutral-300 text-center leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                {label}
            </span>
        </>
    );

    const className = "group flex flex-col items-center justify-start gap-2 w-full cursor-pointer bg-transparent border-none p-0";

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={className}>
                {content}
            </button>
        );
    }

    return (
        <Link to={to || '#'} className={className}>
            {content}
        </Link>
    );
};

export default QuickActionButton;
