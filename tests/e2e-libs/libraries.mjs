// The registry. An exercise is `exercises/<name>.mjs`, derived rather than written out beside the
// name: a copied row naming another library's file would run that library's checks under this one's
// name, and stay green.
import { join } from 'node:path';
import { HERE } from './paths.mjs';

const NAMES = ['rxjs', 'codemirror', 'three', 'htmlparser2'];

const PLAIN_SEGMENT = /^[\w\-.]+$/;
for (const name of NAMES) {
  if (!PLAIN_SEGMENT.test(name)) {
    throw new Error(`library name '${ name }' is not a plain path segment - a cell's identity is split back into a directory`);
  }
}

export const libraries = NAMES.map(name => ({ name, exercise: join(HERE, 'exercises', `${ name }.mjs`) }));

export function librariesMatching(filter) {
  const found = libraries.filter(lib => filter === undefined || lib.name === filter);
  if (!found.length) throw new Error(`no library matches filter '${ filter }'`);
  return found;
}
