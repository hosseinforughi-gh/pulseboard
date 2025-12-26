import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/services/projects.services";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 5;

export function useProjectsList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const debouncedQ = useDebouncedValue(q, 300);

  const rawPage = searchParams.get("page");
  const pageParam = Number(rawPage ?? "1");
  const isPageParamValid = Number.isFinite(pageParam) && pageParam > 0;
  const page = isPageParamValid ? pageParam : 1;

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

  // اگر page تو URL عدد درست نیست، همون اول درستش کن
  useEffect(() => {
    if (rawPage == null) return; // اصلاً page تو URL نیست
    if (isPageParamValid) return;

    const sp = new URLSearchParams(searchParams);
    sp.set("page", "1");
    setSearchParams(sp, { replace: true });
  }, [rawPage, isPageParamValid, searchParams, setSearchParams]);

  // وقتی دیتا آماده شد، اگر page از totalPages بزرگ‌تر بود (مثلاً بعد از delete)، URL رو اصلاح کن
  useEffect(() => {
    if (!query.isSuccess) return;
    if (page === safePage) return; // یعنی از محدوده بیرون نیست

    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(safePage));
    setSearchParams(sp, { replace: true });
  }, [query.isSuccess, page, safePage, searchParams, setSearchParams]);

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
    const clamped = Math.max(1, Math.min(nextPage, totalPages));
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(clamped));
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
