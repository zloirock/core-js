// Registry of libraries exercised by the suite. Each entry declares which tiers it participates
// in (`throughput` = measured; `runtime` = emitted as an ES5 artifact and verified) and the path
// to its deterministic exercise module (must export `run()` -> Promise or plain { checks }).
import { join } from 'node:path';

const HERE = import.meta.dirname;

export const libraries = [
  {
    name: 'rxjs',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'rxjs.mjs'),
    methods: ['entry-global', 'usage-global', 'usage-pure'],
  },
  {
    name: 'codemirror',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'codemirror.mjs'),
    methods: ['entry-global', 'usage-global', 'usage-pure'],
  },
  {
    name: 'three',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'three.mjs'),
    methods: ['entry-global', 'usage-global', 'usage-pure'],
  },
];

// Select a tier's libraries, optionally narrowed to one by name. A typo'd filter that matches
// nothing must fail loudly here rather than let a runner write a green empty report.
export function librariesIn(tier, filter) {
  const found = libraries.filter(l => l.tiers.includes(tier) && (!filter || l.name === filter));
  if (!found.length) throw new Error(`no ${ tier } library matches filter '${ filter ?? '' }'`);
  return found;
}
