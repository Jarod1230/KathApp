import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  de: {
    translation: {
      appName: 'KathApp',
      nav: { home: 'Start', admin: 'Admin' },
      home: {
        title: 'Willkommen',
        blurb:
          'Mehrsprachiger Wissenshub — UI-Locale in der URL, Content-Locale getrennt.',
        localeNote:
          'Stub: öffentliche Route. Keine erfundenen Heiligen-/Wunderinhalte.',
      },
      admin: {
        title: 'Admin (Stub)',
        blurb: 'Admin-Routenbaum-Platzhalter für Reviewer/Admin.',
      },
    },
  },
  en: {
    translation: {
      appName: 'KathApp',
      nav: { home: 'Home', admin: 'Admin' },
      home: {
        title: 'Welcome',
        blurb:
          'Multilingual knowledge hub — UI locale in the URL, content locale separate.',
        localeNote:
          'Stub: public route. No invented saint/miracle content.',
      },
      admin: {
        title: 'Admin (stub)',
        blurb: 'Admin route-tree placeholder for reviewer/admin surfaces.',
      },
    },
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: 'de',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
