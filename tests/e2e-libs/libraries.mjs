// The registry. An exercise is `exercises/<name>.mjs`, derived rather than written out beside the
// name: a copied row naming another library's file would run that library's checks under this one's
// name, and stay green.
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { HERE } from './paths.mjs';

const NAMES = [
  'rxjs', 'codemirror', 'three', 'htmlparser2', 'echarts', 'planck', 'tanstack-table', 'es-toolkit', 'ml-matrix',
  'colorjs', 'd3-scale', 'graphql', 'kysely', 'markdown-it', 'zod3', 'liquidjs', 'ical', 'minimatch', 'immutable',
  'xregexp', 'highlight', 'lodash',
];

const EXERCISE_HELPERS = new Set(['checks.mjs', 'process-env.mjs']);

export const PLAIN_SEGMENT = /^[\w\-.]+$/;
for (const name of NAMES) {
  if (!PLAIN_SEGMENT.test(name)) {
    throw new Error(`library name '${ name }' is not a plain path segment - a cell's identity is split back into a directory`);
  }
}

export function assertExerciseRegistry(files, names = NAMES) {
  const expected = new Set(names.map(name => `${ name }.mjs`));
  if (expected.size !== names.length) throw new Error('duplicate names in the exercise registry');
  const found = new Set(files.filter(file => file.endsWith('.mjs') && !EXERCISE_HELPERS.has(file)));
  const missing = [...expected.difference(found)];
  const unregistered = [...found.difference(expected)].sort();
  if (missing.length || unregistered.length) {
    throw new Error(`exercise registry mismatch (missing: ${ missing.join(', ') || 'none' }; unregistered: ${ unregistered.join(', ') || 'none' })`);
  }
}

const exerciseDir = join(HERE, 'exercises');
assertExerciseRegistry(await readdir(exerciseDir));

export const libraries = NAMES.map(name => ({
  name,
  exercise: join(exerciseDir, `${ name }.mjs`),
}));

export function librariesMatching(filter) {
  const found = libraries.filter(lib => filter === undefined || lib.name === filter);
  if (!found.length) throw new Error(`no library matches filter '${ filter }'`);
  return found;
}
