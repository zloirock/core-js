// Registry of libraries exercised by the suite. Each entry declares which tiers it participates
// in (`throughput` = measured; `runtime` = emitted as an ES5 artifact and verified) and the path
// to its deterministic exercise module (must export `run()` -> Promise or plain { checks }).
//
// Every library runs every method, so the method list is NOT per-library: it is `METHODS` in
// build.mjs, and the runners iterate that. A per-library copy used to live here, identical in all
// three entries; it was removed because the code around it never honoured the variation it implied
// (pipeline validated `methodFilter` against METHODS while iterating the per-library list, and
// throughput built its report columns from METHODS while filling them from the per-library list —
// so a library declaring a subset would have produced a silently empty report or a hole-ridden
// table). If a library ever needs a subset, reintroduce it deliberately and teach those two
// runners to respect it.
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
];

// Select a tier's libraries, optionally narrowed to one by name. A typo'd filter that matches
// nothing must fail loudly here rather than let a runner write a green empty report.
export function librariesIn(tier, filter) {
  const found = libraries.filter(l => l.tiers.includes(tier) && (!filter || l.name === filter));
  if (!found.length) throw new Error(`no ${ tier } library matches filter '${ filter ?? '' }'`);
  return found;
}
