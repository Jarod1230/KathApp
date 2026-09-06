/** Derived paging state for the search result list (ADR 0004). */
export interface PageState {
  page: number;
  pageCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  previousOffset: number;
  nextOffset: number;
  /** 1-based index of the first result shown, 0 when there are none. */
  firstShown: number;
  lastShown: number;
}

export function pageState(input: {
  total: number;
  limit: number;
  offset: number;
}): PageState {
  const limit = Math.max(1, input.limit);
  const offset = Math.max(0, input.offset);
  const total = Math.max(0, input.total);

  const pageCount = Math.ceil(total / limit);
  const shown = Math.max(0, Math.min(limit, total - offset));

  return {
    page: Math.floor(offset / limit) + 1,
    pageCount,
    hasPrevious: offset > 0,
    hasNext: offset + limit < total,
    previousOffset: Math.max(0, offset - limit),
    nextOffset: offset + limit,
    firstShown: shown > 0 ? offset + 1 : 0,
    lastShown: shown > 0 ? offset + shown : 0,
  };
}
