"use client";

import { useState, useEffect, useCallback } from "react";
import { DatasetSummary, DatasetsResponse } from "@/types/dataset";
import SearchBar from "./SearchBar";
import DatasetCard, { DatasetRow } from "./DatasetCard";
import Pagination from "./Pagination";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const DEFAULT_LIMIT = 20;

interface DatasetTableProps {
  initialData: DatasetsResponse;
  categories: string[];
}

export default function DatasetTable({
  initialData,
  categories,
}: DatasetTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [datasets, setDatasets] = useState<DatasetSummary[]>(initialData.data);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const applyResponse = useCallback((res: DatasetsResponse) => {
    setDatasets(res.data);
    setTotal(res.total);
    setPage(res.page);
    setTotalPages(res.totalPages);
  }, []);

  const fetchData = useCallback(
    (search: string, category: string, targetPage: number) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category) params.set("category", category);
      params.set("page", String(targetPage));
      params.set("limit", String(DEFAULT_LIMIT));

      setLoading(true);

      fetch(`/api/datasets?${params.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          return res.json();
        })
        .then((json: DatasetsResponse) => {
          if (!Array.isArray(json.data)) throw new Error("Invalid response");
          applyResponse(json);
        })
        .catch(() => applyResponse(initialData))
        .finally(() => setLoading(false));
    },
    [initialData, applyResponse]
  );

  useEffect(() => {
    if (!debouncedSearch.trim() && !selectedCategory) {
      applyResponse(initialData);
      return;
    }
    fetchData(debouncedSearch, selectedCategory, 1);
  }, [debouncedSearch, selectedCategory, initialData, fetchData, applyResponse]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchData(debouncedSearch, selectedCategory, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [fetchData, debouncedSearch, selectedCategory]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {loading
            ? "Loading..."
            : `${total} dataset${total !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {datasets.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No datasets found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isExpanded={expandedIds.has(dataset.id)}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left text-sm font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-[25%]">
                    Title
                  </th>
                  <th className="text-left text-sm font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-[45%]">
                    Description
                  </th>
                  <th className="text-left text-sm font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-[18%]">
                    Category
                  </th>
                  <th className="text-left text-sm font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-[12%]">
                    Access
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datasets.map((dataset) => (
                  <DatasetRow
                    key={dataset.id}
                    dataset={dataset}
                    isExpanded={expandedIds.has(dataset.id)}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
