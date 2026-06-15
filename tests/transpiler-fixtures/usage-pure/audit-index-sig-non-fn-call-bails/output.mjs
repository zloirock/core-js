import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a CALL through a non-function index signature (`d[k]()` where the value is `number[]`) is not
// statically resolvable - the value is not callable - so it bails to the generic helper rather than
// hand back the value type as if it were the call return
interface D {
  [k: string]: number[];
}
declare const d: D;
declare const k: string;
const r = _at(_ref = d[k]()).call(_ref, 0);
export { r };