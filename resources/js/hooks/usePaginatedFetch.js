import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useDebouncedValue(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

/**
 * Server-side pagination via AJAX/Fetch.
 * Backend expects ?limit=&offset= and returns { data, total, limit, offset }.
 */
export function usePaginatedFetch(url, { search = '', filters = {}, sort = '', enabled = true } = {}) {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);

    const filterKey = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        try {
            const offset = (currentPage - 1) * itemsPerPage;
            const response = await axios.get(url, {
                params: { limit: itemsPerPage, offset, search, sort, ...filters },
            });
            setData(response.data.data ?? []);
            setTotal(response.data.total ?? 0);
            if (response.data.stats) {
                setStats(response.data.stats);
            }
        } catch {
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [url, currentPage, itemsPerPage, search, sort, filterKey, enabled]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, sort, filterKey, itemsPerPage]);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleItemsPerPageChange = (n) => {
        setItemsPerPage(n);
        setCurrentPage(1);
    };

    return {
        data,
        total,
        stats,
        loading,
        currentPage,
        itemsPerPage,
        setCurrentPage: handlePageChange,
        setItemsPerPage: handleItemsPerPageChange,
        refetch: fetchData,
    };
}
