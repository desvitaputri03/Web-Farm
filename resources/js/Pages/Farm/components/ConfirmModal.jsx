import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini?',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-body animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-[#DCE5F0] rounded-2xl p-6 shadow-2xl max-w-[360px] w-full text-center max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="text-sm font-extrabold text-[#162033] font-heading mb-2">
            {title}
          </h3>
        )}
        <p className="text-xs font-medium text-slate-600 py-1 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-center gap-3 mt-5 pt-3 border-t border-[#DCE5F0]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-[#DCE5F0] text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0D2847] shadow-xs transition-all cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
