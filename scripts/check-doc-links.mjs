#!/usr/bin/env node
/**
 * Checks that every relative link in the Markdown files points at something
 * that exists.
 *
 * A dead link inside documentation fails silently: nothing breaks, the file
 * just stops being findable. This project's docs cross-reference heavily —
 * README to docs/README.md to the ADRs and back — so the links are load
 * bearing.
 *
 * External links are not fetched. This runs offline and must stay fast.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage']);

function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const problems = [];

for (const file of markdownFiles(root)) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(LINK)) {
    const raw = match[1];
    if (/^(https?:|mailto:|#)/.test(raw)) continue;

    const target = raw.split('#')[0];
    if (!target) continue;

    const candidate = resolve(dirname(file), target);
    try {
      statSync(candidate);
    } catch {
      problems.push(`${file.slice(root.length + 1)} → ${raw}`);
    }
  }
}

if (problems.length > 0) {
  console.error('Tote Links in der Dokumentation:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log('Doku-Links: alle relativen Ziele existieren.');
