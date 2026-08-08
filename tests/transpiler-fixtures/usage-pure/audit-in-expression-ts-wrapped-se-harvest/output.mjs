import _Map from "@core-js/pure/actual/map/constructor";
// a polyfilled `key in obj` whose obj carries a side effect behind a TS wrapper (`(y = Map) as any`).
// the fold (`'groupBy' in Map` -> `true`, Map.groupBy is always defined) must still run the assignment
// SE and pull in its `_Map` import. the SE harvest must peel the TS expression wrapper in the shared
// planner so both emitters agree - one emitter once dropped the whole `y = Map`, emitting a bare `true`.
let y;
const r = (y = _Map, true);