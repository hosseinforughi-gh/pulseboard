import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProjectsPage } from "@/services/projects.services";

import { projectsKeys } from "./projects.keys";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

function toInt(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

type PaginationItem = number | "ellipsis";

function buildPagination(current: number, total: number): PaginationItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: PaginationItem[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p++) items.push(p);
  if (right < total - 1) items.push("ellipsis");

  items.push(total);
  return items;
}

export function useProjectsList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = toInt(searchParams.get("page"), 1);
  const limit = toInt(searchParams.get("limit"), 8);

  const qParam = searchParams.get("q") ?? "";
  const q = qParam.trim();

  const [searchInput, setSearchInput] = useState(qParam);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // اگر با back/forward یا تغییر URL مقدار q عوض شد، input هم sync شود
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // بعد از debounce: q را در URL بگذار و page را 1 کن
  useEffect(() => {
    const nextQ = debouncedSearch.trim();
    if (nextQ === q) return;

    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);

        if (nextQ) sp.set("q", nextQ);
        else sp.delete("q");

        sp.set("page", "1");
        sp.set("limit", String(limit));
        return sp;
      },
      { replace: true }
    );
  }, [debouncedSearch, q, limit, setSearchParams]);

  const query = useQuery({
    queryKey: projectsKeys.list({ page, limit, q }),
    queryFn: () => getProjectsPage({ page, limit, q }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const items = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const total = query.data?.total ?? 0;

  useEffect(() => {
    if (query.isLoading || query.isFetching) return;
    if (total === 0) return;

    if (items.length === 0 && page > 1) {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          sp.set("page", String(page - 1));
          sp.set("limit", String(limit));
          if (q) sp.set("q", q);
          else sp.delete("q");
          return sp;
        },
        { replace: true }
      );
    }
  }, [
    items.length,
    page,
    limit,
    q,
    total,
    query.isLoading,
    query.isFetching,
    setSearchParams,
  ]);

  useEffect(() => {
    if (page <= totalPages) return;

    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);

        sp.set("page", String(totalPages));
        sp.set("limit", String(limit));

        if (q) sp.set("q", q);
        else sp.delete("q");

        return sp;
      },
      { replace: true }
    );
  }, [page, totalPages, limit, q, setSearchParams]);

  const paginationItems = useMemo(
    () => buildPagination(page, totalPages),
    [page, totalPages]
  );

  function setPage(nextPage: number) {
    const safe = Math.max(1, Math.min(totalPages, Math.floor(nextPage)));
    if (safe === page) return;
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("page", String(safe));
        sp.set("limit", String(limit));

        if (q) sp.set("q", q);
        else sp.delete("q");

        return sp;
      },
      { replace: true }
    );
  }

  return {
    items,
    searchInput,
    setSearchInput,

    page,
    limit,
    totalPages,
    paginationItems,
    setPage,

    ...query,
  };
}
