// The registry: one entry per library, pointing at its exercise. Methods are not per-library - the
// runners iterate `METHODS` from build.mjs, and a subset here would have to be taught to them as
// well or it yields a hole-ridden report.
import { join } from 'node:path';

const HERE = import.meta.dirname;

export const libraries = [
  {
    name: 'rxjs',
    exercise: join(HERE, 'exercises', 'rxjs.mjs'),
  },
  {
    name: 'codemirror',
    exercise: join(HERE, 'exercises', 'codemirror.mjs'),
  },
  {
    name: 'three',
    exercise: join(HERE, 'exercises', 'three.mjs'),
  },
  {
    // The TypeScript fixture: built from the libraries' own `src/**/*.ts`, not their published JS -
    // see `TS_SOURCE_PACKAGES` in build.mjs. Only rollup has been taught to resolve `.ts` here, which
    // both runners use, and which is also where the phase axis this fixture exists for lives.
    name: 'htmlparser2',
    exercise: join(HERE, 'exercises', 'htmlparser2.mjs'),
  },
];

// The libraries, optionally narrowed to one by name. A typo'd filter that matches nothing must fail
// loudly here rather than let a runner write a green empty report.
//
// `=== undefined` is the test for "no filter", not truthiness: '' and 0 are things the user typed, and
// under `!filter` either returns the WHOLE registry past the gate below, which fires on an empty
// result. `cli.mjs` guarantees the argument arrives as a string or not at all.
export function librariesMatching(filter) {
  const found = libraries.filter(lib => filter === undefined || lib.name === filter);
  if (!found.length) throw new Error(`no library matches filter '${ filter }'`);
  return found;
}
