import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const de = {
  common: {
    appName: 'KathApp',
    nav: {
      main: 'Hauptnavigation',
      home: 'Start',
      search: 'Suche',
      suggest: 'Vorschlag',
      admin: 'Admin',
      backPublic: 'Zur öffentlichen Ansicht',
    },
    home: {
      title: 'Willkommen',
      blurb:
        'Mehrsprachiger Wissenshub — UI-Locale in der URL, Content-Locale getrennt.',
      localeNote:
        'Öffentliche Shell. Keine erfundenen Heiligen-/Wunderinhalte.',
      ctaSearch: 'Zur Suche',
    },
  },
  entity: {
    search: {
      title: 'Suche',
      placeholder: 'Begriff…',
      submit: 'Suchen',
      q: 'q',
      type: 'type',
      typeAll: 'Alle Typen',
      contentLocale: 'contentLocale',
      loading: 'Suche läuft…',
      emptyPrompt: 'Suchbegriff eingeben. Leere Datenbank → keine Treffer.',
      emptyResults: 'Keine veröffentlichten Treffer.',
      error: 'Suche fehlgeschlagen (API erreichbar?).',
    },
    chips: {
      saint: 'Heiliger',
      miracle: 'Wunder',
      source: 'Quelle',
      slot: 'Relation-Chip',
    },
    detail: {
      kind: 'entityType',
      loading: 'Lade…',
      notFoundTitle: 'Nicht gefunden',
      notFound:
        'Kein veröffentlichter Eintrag (404) — Drafts und Soft-Deletes sind ausgeblendet.',
      error: 'Detail konnte nicht geladen werden.',
      contentLocale: 'Content-Locale',
      backSearch: 'Zurück zur Suche',
      feastNote: 'Festnotiz',
      approxDate: 'Ungefähres Datum',
      language: 'Sprache',
      author: 'Autor',
      year: 'Jahr',
    },
    slots: {
      body: 'Inhalt',
      bodyEmpty: 'Kein Text für diese Locale.',
      citations: 'Quellen',
      citationsEmpty: 'Keine Citations verknüpft.',
      relations: 'Verknüpfungen',
      relationsEmpty: 'Keine Edges (Chips) vorhanden.',
    },
    citation: {
      tappable: 'Citation (tippbar) — Locus / Source',
      latinHint: 'Latein-Umschalter / Nebeneinander (Serif)',
    },
  },
  suggest: {
    form: {
      title: 'Vorschlag einreichen',
      stub: 'Stub-Formular (contributor+) — kein Submit ohne Auth.',
      entityType: 'Entitätstyp',
      authHint: 'POST /v1/suggestions folgt mit Bearer + Rollen.',
      submit: 'Einreichen',
    },
    status: {
      title: 'Vorschlagsstatus',
      stub: 'Statusanzeige submitted | in_review | accepted | rejected.',
    },
  },
  admin: {
    shellTitle: 'KathApp Admin',
    navLabel: 'Admin-Navigation',
    nav: {
      dashboard: 'Übersicht',
      review: 'Review',
      saints: 'Heilige',
      miracles: 'Wunder',
      sources: 'Quellen',
    },
    dashboard: {
      title: 'Admin (Stub)',
      stub: 'Getrennter Admin-Routenbaum — Reviewer/Admin hinter Auth-Gate später.',
    },
    review: {
      title: 'Review-Queue',
      stub: 'Suggestion-Queue Stub — Accept/Reject später über API.',
    },
    list: {
      title: {
        saints: 'Heilige (Liste)',
        miracles: 'Wunder (Liste)',
        sources: 'Quellen (Liste)',
      },
      stub: 'status-Filter draft|published später.',
      editStub: 'Beispiel-Edit öffnen',
    },
    edit: {
      title: {
        saints: 'Heiliger bearbeiten',
        miracles: 'Wunder bearbeiten',
        sources: 'Quelle bearbeiten',
      },
      stub: 'Edit/Publish-Stub — Publish-Gates serverseitig.',
    },
  },
};

const en = {
  common: {
    appName: 'KathApp',
    nav: {
      main: 'Main navigation',
      home: 'Home',
      search: 'Search',
      suggest: 'Suggest',
      admin: 'Admin',
      backPublic: 'Back to public site',
    },
    home: {
      title: 'Welcome',
      blurb:
        'Multilingual knowledge hub — UI locale in the URL, content locale separate.',
      localeNote: 'Public shell. No invented saint/miracle content.',
      ctaSearch: 'Go to search',
    },
  },
  entity: {
    search: {
      title: 'Search',
      placeholder: 'Query…',
      submit: 'Search',
      q: 'q',
      type: 'type',
      typeAll: 'All types',
      contentLocale: 'contentLocale',
      loading: 'Searching…',
      emptyPrompt: 'Enter a query. Empty database → no hits.',
      emptyResults: 'No published matches.',
      error: 'Search failed (is the API up?).',
    },
    chips: {
      saint: 'Saint',
      miracle: 'Miracle',
      source: 'Source',
      slot: 'Relation chip',
    },
    detail: {
      kind: 'entityType',
      loading: 'Loading…',
      notFoundTitle: 'Not found',
      notFound:
        'No published entity (404) — drafts and soft-deletes are hidden.',
      error: 'Could not load detail.',
      contentLocale: 'Content locale',
      backSearch: 'Back to search',
      feastNote: 'Feast note',
      approxDate: 'Approx. date',
      language: 'Language',
      author: 'Author',
      year: 'Year',
    },
    slots: {
      body: 'Body',
      bodyEmpty: 'No text for this locale.',
      citations: 'Citations',
      citationsEmpty: 'No citations linked.',
      relations: 'Relations',
      relationsEmpty: 'No edge chips yet.',
    },
    citation: {
      tappable: 'Citation (tappable) — locus / source',
      latinHint: 'Latin toggle / side-by-side (serif)',
    },
  },
  suggest: {
    form: {
      title: 'Submit a suggestion',
      stub: 'Stub form (contributor+) — no submit without auth.',
      entityType: 'Entity type',
      authHint: 'POST /v1/suggestions follows with Bearer + roles.',
      submit: 'Submit',
    },
    status: {
      title: 'Suggestion status',
      stub: 'Status display submitted | in_review | accepted | rejected.',
    },
  },
  admin: {
    shellTitle: 'KathApp Admin',
    navLabel: 'Admin navigation',
    nav: {
      dashboard: 'Dashboard',
      review: 'Review',
      saints: 'Saints',
      miracles: 'Miracles',
      sources: 'Sources',
    },
    dashboard: {
      title: 'Admin (stub)',
      stub: 'Separate admin route tree — reviewer/admin auth gate later.',
    },
    review: {
      title: 'Review queue',
      stub: 'Suggestion queue stub — accept/reject via API later.',
    },
    list: {
      title: {
        saints: 'Saints (list)',
        miracles: 'Miracles (list)',
        sources: 'Sources (list)',
      },
      stub: 'status filter draft|published later.',
      editStub: 'Open sample edit',
    },
    edit: {
      title: {
        saints: 'Edit saint',
        miracles: 'Edit miracle',
        sources: 'Edit source',
      },
      stub: 'Edit/publish stub — publish gates enforced server-side.',
    },
  },
};

void i18n.use(initReactI18next).init({
  resources: {
    de,
    en,
  },
  lng: 'de',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'entity', 'admin', 'suggest'],
  interpolation: { escapeValue: false },
});

export default i18n;
