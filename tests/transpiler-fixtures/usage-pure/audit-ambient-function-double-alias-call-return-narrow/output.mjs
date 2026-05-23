import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// declare function getArr(): string[]; const f = getArr; const g = f; g().at(0)
// `resolveRuntimeExpression` walks `g` -> `f` -> `getArr` Identifier; the ambient-function
// retry on the walked Identifier must traverse the FULL alias chain to land on the
// ambient declaration's return annotation. single-hop logic would stop at `f` (no ambient
// for `f`) and fall through to generic `_at`
declare function getArr(): string[];
const f = getArr;
const g = f;
_atMaybeArray(_ref = g()).call(_ref, 0);