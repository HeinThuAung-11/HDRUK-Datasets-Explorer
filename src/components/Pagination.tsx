import { memo } from "react";
import { ChevronIcon } from "./Icons";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default memo(function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pageNumbers: number[] = [];
  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronIcon direction="left" />
        </button>
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-gray-400">...</span>}
          </>
        )}
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              num === page
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {num}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="px-1 text-gray-400">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>
  );
});
