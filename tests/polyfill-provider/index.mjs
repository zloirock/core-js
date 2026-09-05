// orchestrator: runs every polyfill-provider test file in this directory and reports
// the cumulative pass/fail counts. each file is a self-running module - it executes
// its tests on import and throws on failure, so failures surface as load-time errors
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
import './detect-usage.mjs';
import './helpers.mjs';
import './plugin-options.mjs';
import './resolver.mjs';
import './injector-base.mjs';
import './cross-parser-equivalence.mjs';
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

const { green } = chalk;
echo(`\n${ green('all polyfill-provider suites passed') }`);
