# Vision — KathApp

## Zielbild

KathApp ist ein **mehrsprachiger, skalierbarer Wissenshub** für katholisches Wissen weltweit.

Katholiken sollen einfach an Wissen und Informationen gelangen, die sonst schwer erreichbar sind — z. B. lateinische Texte oder Quellen in Universitätsarchiven. Inhalte sind **interaktiv und intelligent nutzbar**: Heilige, Wunder, Quellen und ihre Verknüpfungen bilden einen kuratierten Wissensgraphen.

### Kernfähigkeiten (Zielbild)

- Wissensgraph: Saint, Miracle, Source, Citation, Edge (+ Translation)
- Mehrsprachigkeit: UI-Locale (DE/EN in der URL) getrennt von Content-Locale
- Öffentliches Interface zum Entdecken und Lesen
- Änderungsvorschläge (Suggestions) mit Review-Workflow
- Admin-/Kurationsoberfläche für Freigabe und Pflege
- Versionierte, erweiterbare API (`/v1/`)

## Nicht-Ziele (MVP)

Für das MVP bewusst **nicht** im Scope:

- Vollständiger Graph-Canvas / freies Visual-Editing des gesamten Graphen
- Bulk-Import-Pipelines aus externen Archiven
- Eigenes Search-Cluster / Full-Text-Infra jenseits einfacher Listenfilter
- Liturgischer Kalender / Feasts als eigene Produktsäule
- Social Features (Kommentare, Likes, Feeds)
- Mobile Native Apps
- Automatische KI-Generierung von Heiligen-/Wunderbiografien (keine erfundenen Domänenfakten)
- Offline-first / lokale Sync-Clients

Diese Themen können später laut `docs/roadmap.md` folgen — nicht ohne ADR und Priorisierung durch den Stabschef.
