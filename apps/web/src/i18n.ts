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
        'Stub: öffentliche Shell. Keine erfundenen Heiligen-/Wunderinhalte.',
      ctaSearch: 'Zur Suche',
    },
  },
  entity: {
    search: {
      title: 'Suche',
      stub: 'Stub-Trefferliste — API später über GET /v1/search.',
      q: 'q',
      type: 'type',
      contentLocale: 'contentLocale',
      exampleHint: 'Beispiel-Chips (keine echten Daten):',
    },
    chips: {
      saint: 'Heiliger (Stub)',
      miracle: 'Wunder (Stub)',
      source: 'Quelle (Stub)',
      slot: 'Relation-Chip',
    },
    detail: {
      kind: 'entityType',
      title: {
        saint: 'Heiliger (Detail-Stub)',
        miracle: 'Wunder (Detail-Stub)',
        source: 'Quelle (Detail-Stub)',
      },
      stub: 'Registry-Slot: Header / Body / Citations / Relations.',
      contentLocale: 'Content-Locale',
      backSearch: 'Zurück zur Suche',
    },
    slots: {
      body: 'Inhalt',
      bodyStub: 'Kurzvita / Summary — Translations aus Contract-v1.',
      citations: 'Quellen',
      citationsStub:
        'Citation immer tippbar; excerpt und excerptLatin getrennt.',
      relations: 'Verknüpfungen',
      relationsStub: 'Chips-Slot (Graph-Canvas später).',
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
      localeNote: 'Stub: public shell. No invented saint/miracle content.',
      ctaSearch: 'Go to search',
    },
  },
  entity: {
    search: {
      title: 'Search',
      stub: 'Stub results list — API later via GET /v1/search.',
      q: 'q',
      type: 'type',
      contentLocale: 'contentLocale',
      exampleHint: 'Example chips (no real data):',
    },
    chips: {
      saint: 'Saint (stub)',
      miracle: 'Miracle (stub)',
      source: 'Source (stub)',
      slot: 'Relation chip',
    },
    detail: {
      kind: 'entityType',
      title: {
        saint: 'Saint (detail stub)',
        miracle: 'Miracle (detail stub)',
        source: 'Source (detail stub)',
      },
      stub: 'Registry slots: Header / Body / Citations / Relations.',
      contentLocale: 'Content locale',
      backSearch: 'Back to search',
    },
    slots: {
      body: 'Body',
      bodyStub: 'Short bio / summary — translations from Contract-v1.',
      citations: 'Citations',
      citationsStub:
        'Citation always tappable; excerpt and excerptLatin kept separate.',
      relations: 'Relations',
      relationsStub: 'Chips slot (graph canvas later).',
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
