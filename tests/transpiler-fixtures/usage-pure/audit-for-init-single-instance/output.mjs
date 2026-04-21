import _at from "@core-js/pure/actual/instance/at";
// For-init destructure with single polyfillable instance + call-expression init.
// `isForInit` branch emits `comma-separated` form instead of `stmtPrefix; ...`.
// Verifies `for (var at = _at(getObj()); cond; step) break;` — needsMemo is false
// for entries.length === 1 + no remaining + no rest.
for (var at = _at(getObj()); cond; step) break;