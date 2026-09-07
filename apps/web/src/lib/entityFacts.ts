import type { EntityDetailResponse } from '@kathapp/shared';

/** A label key plus its already-formatted value, ready for the byline. */
export type Fact = { labelKey: string; value: string };

/**
 * Which facts an entity shows beneath its title. This lived as a nested chain
 * of conditions inside the detail page's JSX, where it could not be checked.
 */
export function entityFacts(detail: EntityDetailResponse): Fact[] {
  const facts: Fact[] = [];

  if (detail.entityType === 'saint' && detail.saint) {
    const { feastNote, deathYear, deathYearApprox } = detail.saint;
    if (feastNote) facts.push({ labelKey: 'detail.feastNote', value: feastNote });
    if (deathYear != null) {
      facts.push({
        labelKey: 'detail.deathYear',
        value: deathYearApprox ? `um ${deathYear}` : String(deathYear),
      });
    }
  }

  if (detail.entityType === 'miracle' && detail.miracle?.approxDate) {
    facts.push({
      labelKey: 'detail.approxDate',
      value: detail.miracle.approxDate,
    });
  }

  if (detail.entityType === 'source' && detail.source) {
    const { language, author, year } = detail.source;
    facts.push({ labelKey: 'detail.language', value: language });
    if (author) facts.push({ labelKey: 'detail.author', value: author });
    if (year != null) facts.push({ labelKey: 'detail.year', value: String(year) });
  }

  return facts;
}
