// orchestrator for babel-plugin unit-test suites (parallel to tests/unplugin/unit.mjs).
// each suite file is a self-running module: imports its dependencies, drives the tests
// on import, calls `finish()` to print the per-suite summary and throws on failure.
// failures surface as load-time errors here, then `test-babel-plugin-unit` exits non-zero
import './babel-compat.mjs';
import './import-injector.mjs';
import './catch-extractor-mode.mjs';
import './fresh-path-memo.mjs';
import './mutation-gate-superset.mjs';
import './transform-idempotence.mjs';
import './transform-idempotence-pure.mjs';
import './post-sweep-introduced-global.mjs';
import './late-paren-compensation-gate.mjs';
import './per-file-teardown.mjs';
import './fixture-shard-protocol.mjs';
