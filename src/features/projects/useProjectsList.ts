import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getProjects,
  type Paginated,
  type Project,
} from "@/services/projects.services";
import { projectsKeys } from "./projects.keys";
import { useDebouncedValue } from "@/hooks/useDebouncedValue"; // مسیر خودت

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

  const [searchInput, setSearchInput] = useState(qParam);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // sync input با URL (back/forward یا تغییر دستی)
  useEffect(() => {
    setSearchInput(qParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  // بعد از debounce: q رو تو URL ست کن و page رو 1 کن
  useEffect(() => {
    const nextQ = debouncedSearch.trim();
    const prevQ = (searchParams.get("q") ?? "").trim();

    if (nextQ === prevQ) return;

    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);

      if (nextQ) sp.set("q", nextQ);
      else sp.delete("q");

      sp.set("page", "1");
      sp.set("limit", String(limit));
      return sp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, limit]);

  const query = useQuery({
    queryKey: projectsKeys.list({ page, limit, q: qParam }),
    queryFn: () =>
      getProjects({ page, limit, q: qParam }) as Promise<Paginated<Project>>,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const totalPages = query.data?.totalPages ?? 1;

  const paginationItems = useMemo(
    () => buildPagination(page, totalPages),
    [page, totalPages]
  );

  function setPage(nextPage: number) {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);

      sp.set("page", String(nextPage));
      sp.set("limit", String(limit));

      if (qParam.trim()) sp.set("q", qParam.trim());
      else sp.delete("q");

      return sp;
    });
  }

  return {
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
