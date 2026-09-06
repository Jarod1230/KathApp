# Glossary — KathApp (Contract-v1)

Placeholders only — **no invented hagiographic content**.

## Saint

Person node. Display identity via **Translation** (`name`, `shortBio`).

| Field | Notes |
| --- | --- |
| `id` | Stable id |
| `status` | `draft` \| `published` |
| `slug?` | Optional URL key (not a display name) |
| `feastNote?` | Non-localized feast note |
| `deathYear?` | Calendar year if known |
| `deathYearApprox?` | Approx flag for `deathYear` |
| `deletedAt`, `createdAt`, `updatedAt` | Soft delete + timestamps |

## Miracle

Event node. Narrative via **Translation** (`title`, `summary`). Linked to Saints via `saint_miracle` **Edge**.

| Field | Notes |
| --- | --- |
| `id` | Stable id |
| `status` | `draft` \| `published` |
| `approxDate?` | Free-form approximate date string |
| `deletedAt`, `createdAt`, `updatedAt` | Soft delete + timestamps |

## Source

Bibliographic / archival source. Title and notes via **Translation** (`title`, `notes`).

| Field | Notes |
| --- | --- |
| `id` | Stable id |
| `status` | `draft` \| `published` |
| `language` | Source language code |
| `author?` | Author / corporate author |
| `year?` | Publication / manuscript year |
| `shelfmark?` | Shelfmark / call number |
| `url?` | External URL |
| `deletedAt`, `createdAt`, `updatedAt` | Soft delete + timestamps |

## Citation

Concrete pointer into a **Source**. Latin excerpt is separate from locale excerpt.

| Field | Notes |
| --- | --- |
| `id` | Stable id |
| `sourceId` | Required Source link |
| `locus` | Page, folio, section, fragment |
| `excerpt?` | Locale-facing excerpt |
| `excerptLatin?` | Latin excerpt (separate) |
| `entityType?`, `entityId?` | Optional polymorphic link |
| `deletedAt`, `createdAt`, `updatedAt` | Soft delete + timestamps |

## Edge

Typed relationship. `fromId` / `toId` follow type-name order (left → right).

| Field | Notes |
| --- | --- |
| `id` | Stable id |
| `type` | `saint_miracle` \| `miracle_source` \| `saint_source` |
| `fromId`, `toId` | Entity ids per type convention |
| `citationId?` | Optional supporting Citation |
| `note?` | Curator note |
| `deletedAt`, `createdAt`, `updatedAt` | Soft delete + timestamps |

## Translation

Localized field for a target entity and content locale (independent of UI locale).

| Field | Notes |
| --- | --- |
| `entityType`, `entityId` | Target entity |
| `locale` | Content locale |
| `field` | e.g. `name`, `shortBio`, `title`, `summary`, `notes` |
| `value` | Localized string |
| Unique | `(entityType, entityId, locale, field)` |

## Suggestion

Proposed change awaiting review.

| Field | Notes |
| --- | --- |
| `schemaVersion` | Payload evolution |
| `payload` | JSON proposal body |
| `status` | `submitted` \| `in_review` \| `accepted` \| `rejected` |
| `entityType`, `entityId?` | Polymorphic target |

## Roles (auth)

- `viewer` — public read
- `contributor` — submit suggestions
- `reviewer` — review suggestions
- `admin` — full curation / admin surfaces

## Publish-Gates

Before setting `status` to `published`:

1. **Translation DE|EN** for required fields of that entity
   - Saint: `name` (and `shortBio` when used)
   - Miracle: `title` (and `summary` when used)
   - Source: `title` (and `notes` when used)
2. **Citation** where a claim requires sourcing (Miracle claims; Source-backed assertions)
3. **Miracle** must have ≥1 `saint_miracle` **Edge**
