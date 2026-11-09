import React from 'react';

export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <span {...props} className={`font-black text-[#12355B] tracking-wider uppercase font-brand text-2xl ${className}`}>
            SIMANTRA
        </span>
    );
}
