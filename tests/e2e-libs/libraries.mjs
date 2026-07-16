// Registry of libraries exercised by the suite. Each entry declares which tiers it participates
// in (`throughput` = measured; `runtime` = emitted as an ES5 artifact and verified) and the path
// to its deterministic exercise module (must export `run()` -> Promise<{ results, checks }>).
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const libraries = [
  {
    name: 'rxjs',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'rxjs.mjs'),
    methods: ['entry-global', 'usage-global', 'usage-pure'],
    notes: 'Headless reactive pipelines; exercises Promise/Symbol/Map/Set + Babel iterator helpers.',
  },
];

export const librariesIn = tier => libraries.filter(l => l.tiers.includes(tier));
