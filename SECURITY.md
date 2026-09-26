# Sicherheit

## Eine Lücke melden

**Bitte nicht als öffentliches Issue.** Nutze stattdessen den
[privaten Meldeweg von GitHub](https://github.com/Jarod1230/KathApp/security/advisories/new).

Hilfreich ist: was du beobachtet hast, wie man es nachvollzieht, und welche
Auswirkung du siehst. Eine Einschätzung des Schweregrads brauchst du nicht
mitzuliefern.

## Stand des Projekts

KathApp ist im Aufbau und hat noch keinen produktiven Betrieb. Zwei Punkte, die
man kennen sollte, bevor man das ändert:

**Der Dev-Login ist ein Entwicklungswerkzeug.** `POST /v1/auth/dev-login` stellt
Tokens für beliebige E-Mail-Adressen in beliebiger Rolle aus. Er ist
ausgeschaltet, sofern `AUTH_DEV_LOGIN` nicht exakt `true` ist, und `NODE_ENV`
schaltet ihn nicht ein. Siehe [ADR 0003](docs/decisions/0003-dev-jwt-login.md).
Ein echter Identitätsanbieter ist noch nicht entschieden.

**`JWT_SECRET` hat keinen Rückfallwert.** Fehlt es, startet die API nicht. Das
ist Absicht: ein eingebauter Standardwert wäre im Repository nachlesbar.

## Was hier keine Lücke ist

- Dass die öffentliche Suche eine leere Liste liefert. Die Datenbank ist
  absichtlich ohne Seed.
- Dass unveröffentlichte Einträge nicht erscheinen. Das ist das Publish-Gate,
  und es soll so sein.

Umgekehrt gilt: **wenn unveröffentlichte Daten irgendwo doch auftauchen — auch
nur ein Feld an einem Citation-Chip oder einer Verknüpfung — ist das ein
meldenswerter Fehler.** Genau diese Klasse ist hier schon einmal aufgetreten,
siehe `docs/lessons-learned.md`.
