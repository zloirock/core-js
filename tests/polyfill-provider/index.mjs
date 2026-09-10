// orchestrator: runs every polyfill-provider test file in this directory and reports
// the cumulative pass/fail counts. each file is a self-running module - it executes
// its tests on import and throws on failure, so failures surface as load-time errors.
// the list is hand-maintained, so it is reconciled against the directory at the end: a suite
// added here and left out of the list is run by nothing and reported by nothing
import { fileURLToPath } from 'node:url';
import './resolve-node-type.mjs';
import './destructure-host-shape.mjs';
import './nested-receiver-base.mjs';
import './array-wrapper-drop.mjs';
import './existing-imports.mjs';
import './synth-wks-keys.mjs';
import './destructure-collapse.mjs';
import './fallback-branches.mjs';
import './guard-canon.mjs';
import './wrapper-peels.mjs';
import './detect-syntax.mjs';
import './syntax-set-measurement.mjs';
import './module-format.mjs';
import './detect-usage.mjs';
import './helpers.mjs';
import './plugin-options.mjs';
import './resolver.mjs';
import './injector-base.mjs';
import './cross-parser-equivalence.mjs';
// the one runtime-VALUE row here: a JSX tag hands the component to a renderer, and no other suite
// carries a JSX dialect to run that through
import './jsx-tag-reference-runtime.mjs';
// the resolver's per-parse caches, checked by key COMPLETENESS: two hosts per file whose correct
// answers differ, so a key that lost a dimension collapses both reads onto one helper
import './resolver-cache-keys.mjs';
// the escape-analysis suites: they lock PROVIDER semantics - which positions reach a value, which
// bodies can run with a receiver - and read the verdict through both emitters, since the emitted
// helper family is where that answer becomes observable
import './holder-shape-equivalence.mjs';
import './holder-position-domain.mjs';
import './holder-call-slot-domain.mjs';
import './holder-receiver-body-channels.mjs';
// the escape STAMP's node identity: the census writes a stamp and the pure claim reads one, and a
// spelling only one half knows is a silently dropped widening, not a failure
import './escaped-ctor-stamp.mjs';
// ... and the walk's caching layer, whose contract is not the answer but TERMINATION and a key that
// keeps two different reads apart - both of which become answers on a cyclic alias graph
import './escape-walk-memo-domain.mjs';
// ... and what the two flavors OWE once a stamp stands: the entry alphabets differ, so the answer
// is read off compat rather than off each other - a static both flavors drop agrees with itself
import './flavor-entry-coverage.mjs';

// everything in this directory is either imported above or a shared helper
const HELPERS = new Set(['index.mjs', 'harness.mjs']);
const here = path.dirname(fileURLToPath(import.meta.url));
const listed = await fs.readFile(path.join(here, 'index.mjs'), 'utf8');
const orphans = (await fs.readdir(here))
  .filter(file => file.endsWith('.mjs') && !HELPERS.has(file) && !listed.includes(`'./${ file }'`));
if (orphans.length) throw new Error(`polyfill-provider: ${ orphans.join(', ') } imported by nothing`);

const { green } = chalk;
echo(`\n${ green('all polyfill-provider suites passed') }`);
