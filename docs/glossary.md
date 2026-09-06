# Glossary — KathApp (Contract-v1)

Placeholders only — **no invented hagiographic content**.

## Saint

A person node in the knowledge graph representing a saint (or saint candidate as curated). Holds stable identity fields; localized names/bios live in **Translation** records.

## Miracle

An event node describing a miracle associated with one or more Saints (via **Edge**). Narrative and localized fields use **Translation**; claims must be sourced via **Citation** / **Source**.

## Source

A bibliographic or archival source (book, manuscript, archive record, URL with provenance). Sources are the backbone of verifiability.

## Citation

A concrete pointer into a **Source** (page, folio, section, URL fragment, etc.) used to support statements about Saints, Miracles, or other entities.

## Edge

A typed relationship between two entities (`from` / `to` + `type`). `Edge.type` is an **extensible enum** (e.g. association kinds). Do not invent edge semantics outside Contract/ADR.

## Translation

Localized field set for a target entity and content locale. Independent of UI locale in the URL.

## Suggestion

A proposed change (create/update/delete or patch payload) submitted by a **contributor**, reviewed by a **reviewer**/**admin**.

Statuses:

- `submitted`
- `in_review`
- `accepted`
- `rejected`

Includes `entityType`, payload, and `schemaVersion` for extensibility.

## Roles (auth)

- `viewer` — public read
- `contributor` — submit suggestions
- `reviewer` — review suggestions
- `admin` — full curation / admin surfaces
