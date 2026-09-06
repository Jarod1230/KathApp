// The package has no "type" field, so Node would read dist/esm/*.js as
// CommonJS. This marks that directory as ESM.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'esm');
writeFileSync(join(dist, 'package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n');
