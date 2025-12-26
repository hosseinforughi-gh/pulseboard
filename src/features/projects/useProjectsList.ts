import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/services/projects.services";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 5;

export function useProjectsList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const debouncedQ = useDebouncedValue(q, 300);

  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const query = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const text = debouncedQ.trim().toLowerCase();
    const list = query.data ?? [];
    if (!text) return list;
    return list.filter((p) => p.title.toLowerCase().includes(text));
  }, [query.data, debouncedQ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const setQuery = (nextQ: string) => {
    const sp = new URLSearchParams(searchParams);
    if (nextQ.trim()) sp.set("q", nextQ);
    else sp.delete("q");
    sp.delete("page"); // سرچ عوض شد → صفحه ۱
    setSearchParams(sp, { replace: true });
  };

  const goToPage = (nextPage: number) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(nextPage));
    setSearchParams(sp);
  };

  return {
    // query state
    ...query,

    // ui state
    q,
    setQuery,

    page: safePage,
    totalPages,
    goToPage,

    // data
    items: paged,
    totalFiltered: filtered.length,
  };
}
