import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 25],
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  if (totalItems <= itemsPerPage || totalPages <= 1) {
    return null;
  }
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const btnBase = 'h-8 min-w-[2rem] px-2 flex items-center justify-center rounded-xl border text-xs font-semibold transition-all cursor-pointer';
  const btnIdle = `${btnBase} border-[#DCE5F0] text-[#162033] hover:bg-slate-50 hover:border-[#12355B]/40`;
  const btnActive = `${btnBase} bg-[#12355B] text-white border-[#12355B] font-bold shadow-xs`;
  const btnDisabled = `${btnBase} border-[#DCE5F0] text-slate-400 opacity-40 cursor-not-allowed`;

  return (
    <div className="flex items-center justify-center gap-1 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={currentPage === 1 ? btnDisabled : btnIdle}
        aria-label="Previous"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="h-8 w-8 flex items-center justify-center text-slate-450 dark:text-slate-500 text-xs">
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={currentPage === page ? btnActive : btnIdle}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={currentPage === totalPages ? btnDisabled : btnIdle}
        aria-label="Next"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default Pagination;
