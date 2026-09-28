// The registry. An exercise is `exercises/<name>.mjs`, derived rather than written out beside the
// name: a copied row naming another library's file would run that library's checks under this one's
// name, and stay green.
import { join } from 'node:path';
import { METHODS } from './cells.mjs';
import { HERE } from './paths.mjs';

const NAMES = ['rxjs', 'codemirror', 'three', 'htmlparser2', 'echarts', 'planck', 'tanstack-table', 'es-toolkit', 'ml-matrix', 'colorjs'];

const PLAIN_SEGMENT = /^[\w\-.]+$/;
for (const name of NAMES) {
  if (!PLAIN_SEGMENT.test(name)) {
    throw new Error(`library name '${ name }' is not a plain path segment - a cell's identity is split back into a directory`);
  }
}

// Methods a library cannot pass in the browsers for a reason no polyfill answers. The browser leg
// reports those cells the way it reports unplugin's `pre` - without gating - while every local tier
// still gates them, so the entry narrows exactly one leg. The reason belongs in the exercise
// header, where whoever reads the red cell looks first.
const BROWSER_DIAGNOSTIC = {
  // IE11's ES5 `match` never calls the `exec` that `_wrapRegExp` builds its groups in
  colorjs: ['usage-pure'],
};

// both halves of an entry: a mistyped library or method would leave the exemption quietly dead
for (const [name, methods] of Object.entries(BROWSER_DIAGNOSTIC)) {
  if (!NAMES.includes(name)) throw new Error(`BROWSER_DIAGNOSTIC names '${ name }', which is not in the registry`);
  for (const method of methods) {
    if (!METHODS.includes(method)) throw new Error(`BROWSER_DIAGNOSTIC gives '${ name }' the method '${ method }', which is not one of ${ METHODS.join(', ') }`);
  }
}

export const libraries = NAMES.map(name => ({
  name,
  exercise: join(HERE, 'exercises', `${ name }.mjs`),
  browserDiagnostic: BROWSER_DIAGNOSTIC[name] ?? [],
}));

export function librariesMatching(filter) {
  const found = libraries.filter(lib => filter === undefined || lib.name === filter);
  if (!found.length) throw new Error(`no library matches filter '${ filter }'`);
  return found;
}
