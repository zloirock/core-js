// What a run stands behind. A run's manifest describes THAT run - a filtered one lists the cells it
// was asked for, because those are the only pages on disk once it finishes.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { ARTIFACTS } from './paths.mjs';
import { join } from 'node:path';

export const MANIFEST = join(ARTIFACTS, 'manifest.json');

// read as a consumer, so a missing file is named for what makes one rather than as a bare ENOENT
export async function read() {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    throw new Error('no e2e-libs manifest - `npm run test-e2e-libs-runtime` builds the pages this leg runs');
  }
  if (!Array.isArray(parsed.cells)) throw new Error(`${ MANIFEST } has no cells - rebuild it with test-e2e-libs-runtime`);
  return parsed;
}

export function save(parsed) {
  return writeFile(MANIFEST, `${ JSON.stringify(parsed, null, 2) }\n`);
}

// cells are written only on the success path, so without this a failed one leaves yesterday's green
// page beside a manifest recording the failure, and nothing downstream tells the two apart
export function prepare() {
  return rm(ARTIFACTS, { recursive: true, force: true });
}
