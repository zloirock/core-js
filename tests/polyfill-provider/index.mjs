// orchestrator: runs every polyfill-provider test file in this directory and reports
// the cumulative pass/fail counts. each file is a self-running module - it executes
// its tests on import and throws on failure, so failures surface as load-time errors
import './resolve-node-type.mjs';
import './destructure-host-shape.mjs';
import './detect-syntax.mjs';
import './detect-usage.mjs';
import './helpers.mjs';
import './plugin-options.mjs';
import './resolver.mjs';
import './cross-parser-equivalence.mjs';
// the escape-analysis suites: they lock PROVIDER semantics - which positions reach a value, which
// bodies can run with a receiver - and read the verdict through both emitters, since the emitted
// helper family is where that answer becomes observable
import './holder-shape-equivalence.mjs';
import './holder-position-domain.mjs';
import './holder-call-slot-domain.mjs';
import './holder-receiver-body-channels.mjs';

const { green } = chalk;
echo(`\n${ green('all polyfill-provider suites passed') }`);
