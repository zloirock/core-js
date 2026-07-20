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
  {
    name: 'codemirror',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'codemirror.mjs'),
    methods: ['entry-global', 'usage-global', 'usage-pure'],
    notes: 'The headless half of a real editor: EditorState transactions + position mapping, Lezer parse, '
      + 'INCREMENTAL reparse vs full, token highlighting, and CSS/HTML grammars. A deep graph of '
      + 'mid-sized modern-ESM modules — a third module topology next to three (one monolith) and rxjs (many small).',
  },
  {
    name: 'three',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'three.mjs'),
    methods: ['entry-global', 'usage-global', 'usage-pure'],
    notes: 'A real headless three.js scene project (scene-graph/transforms/raycast/geometry/math); a '
      + 'large modern-ES codebase for throughput, and a functional runtime check that it still computes.',
  },
];

export const librariesIn = tier => libraries.filter(l => l.tiers.includes(tier));
