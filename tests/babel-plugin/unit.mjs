// orchestrator for babel-plugin unit-test suites (parallel to tests/unplugin/unit.mjs).
// each suite file is a self-running module: imports its dependencies, drives the tests
// on import, calls `finish()` to print the per-suite summary and throws on failure.
// failures surface as load-time errors here, then `test-babel-plugin-unit` exits non-zero
import './babel-compat.mjs';
import './import-injector.mjs';
