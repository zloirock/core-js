import _Map from "@core-js/pure/actual/map/constructor";
// a polyfilled `key in obj` whose obj carries a side effect behind a TS wrapper (`(y = Map) as any`).
// the fold (`'groupBy' in Map` -> `true`, Map.groupBy is always defined) must still run the assignment
// SE and pull in its `_Map` import. the SE harvest now peels TS_EXPR_WRAPPERS in the shared planner
// (`unwrapRuntimeExpr`), single-sourced like the symbol path - babel's identity `unwrap` once dropped the
// whole `y = Map` (emitting a bare `true`) while unplugin's TS-peeling unwrap rescued it (divergence)
let y;
const r = (y = _Map, true);