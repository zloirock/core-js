import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A `{ method } = X || fallback` destructure whose operand X is a SE-wrapped proxy-global chain keeps each
// logical operand live; the single-member collapse misses the logical wrapper, so a raw `globalThis.self`
// (undefined off-engine) survived inside the wrapped operand on babel while the other emitter collapsed it.
// lines vary by OPERATOR and OPERAND position and each binds a DISTINCT method so the rewritten helper
// identifies the triggering line: proxy as `||` left, proxy as `&&` left, proxy as short-circuited `||`
// right (parity control - the side effect is dead but the collapse still matches), real-object left
// (control - no proxy). the trailing counter proves the live-operand side effects run in source order.
let c = 0;
const flat = _flatMaybeArray((c++, _globalThis).Array.prototype || {});
const at = _at((c++, _globalThis).Array.prototype && {});
const includes = _includes({} || (c++, _globalThis).Array.prototype);
const map = _mapMaybeArray([1] || {});
export { flat, at, includes, map, c };