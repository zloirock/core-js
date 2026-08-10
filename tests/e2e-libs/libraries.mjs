// Registry of libraries exercised by the suite. Each entry declares which tiers it participates
// in (`throughput` = measured; `runtime` = emitted as an ES5 artifact and verified) and the path
// to its deterministic exercise module (must export `run()` -> Promise or plain { checks }).
//
// Every library runs every method, so the method list is NOT per-library: it is `METHODS` in
// build.mjs, and the runners iterate that. A per-library subset would have to be taught to the
// runners as well - pipeline validates `methodFilter` against METHODS, and throughput builds its
// report columns from it - or it produces a silently empty report and a hole-ridden table.
import { join } from 'node:path';

const HERE = import.meta.dirname;

export const libraries = [
  {
    name: 'rxjs',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'rxjs.mjs'),
  },
  {
    name: 'codemirror',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'codemirror.mjs'),
  },
  {
    name: 'three',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'three.mjs'),
  },
  {
    // The TypeScript fixture: built from the libraries' own `src/**/*.ts`, not their published JS
    // (see `TS_SOURCE_PACKAGES` in build.mjs). Deliberately NOT in `throughput`: that tier drives
    // seven bundlers with no TS resolution and no Babel, and only rollup has been taught to resolve
    // `.ts` here. `runtime` (and `pipeline`, which reads the same list) is rollup-only, which is also
    // where the phase axis this fixture exists for actually lives.
    name: 'htmlparser2',
    tiers: ['runtime'],
    exercise: join(HERE, 'exercises', 'htmlparser2.mjs'),
  },
];

// Select a tier's libraries, optionally narrowed to one by name. A typo'd filter that matches
// nothing must fail loudly here rather than let a runner write a green empty report.
export function librariesIn(tier, filter) {
  const found = libraries.filter(l => l.tiers.includes(tier) && (!filter || l.name === filter));
  if (!found.length) throw new Error(`no ${ tier } library matches filter '${ filter ?? '' }'`);
  return found;
}
