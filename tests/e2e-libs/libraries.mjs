// The registry: which tiers a library takes part in, and where its exercise lives. Methods are not
// per-library - the runners iterate `METHODS` from build.mjs, and a subset here would have to be
// taught to them as well or it yields a hole-ridden report.
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
