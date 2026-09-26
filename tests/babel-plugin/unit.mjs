// orchestrator for babel-plugin unit-test suites (parallel to tests/unplugin/unit.mjs).
// each suite file is a self-running module: imports its dependencies, drives the tests
// on import, calls `finish()` to print the per-suite summary and throws on failure.
// failures surface as load-time errors here, then `test-babel-plugin-unit` exits non-zero
import './babel-compat.mjs';
import './estree-to-babel.mjs';
import './spanless-co-transform.mjs';
import './import-injector.mjs';
import './catch-extractor-mode.mjs';
import './fresh-path-memo.mjs';
import './mutation-gate-superset.mjs';
import './transform-idempotence.mjs';
import './transform-idempotence-pure.mjs';
import './consumed-member-comments.mjs';
import './post-sweep-introduced-global.mjs';
import './late-paren-compensation-gate.mjs';
import './parser-dialect-equivalence.mjs';
import './statement-order-independence.mjs';
import './per-file-teardown.mjs';
// synchronous, and ahead of the suite below on purpose: both capture the debug report off
// `console.log`, and that one awaits inside its capture - a sibling evaluating during that await
// would print into its capture and lose every line, so this one finishes first
import './diagnostics.mjs';
import './late-cjs-diagnostic.mjs';
import './entry-directive-promotion.mjs';
import './injection-spelling-domain.mjs';
import './proxy-global-invariant.mjs';
