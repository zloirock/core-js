import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// A `{ method } = X || fallback` destructure whose operand X is a proxy-global chain wrapped in NESTED
// sequences AND carrying a TRAILING redundant hop (`(c++, (d++, globalThis.self)).window.Array.prototype`)
// must collapse the whole proxy navigation to the root with its buried side effects in source order. the
// prior per-shape boundary math sliced from the bare-identifier start (INSIDE the parens) and cut across
// the nested `))`, emitting unbalanced parens - an unparsable build-break; the unified reconstruction spans
// the whole navigation and harvests every prefix recursively. lines vary by OPERATOR, nesting DEPTH and hop
// count, each binding a DISTINCT method; the trailing counters prove the buried effects run in source order.
// the `&&` line is the statically-dead exception: its always-truthy left narrows the value to the `{}`
// right - nothing to polyfill, so it stays a passthrough (root swap only, hops kept, effects in place).
let a = 0,
  b = 0,
  c = 0,
  d = 0;
const flat = _flatMaybeArray((c++, d++, _globalThis).Array.prototype || {});
const {
  at
} = (c++, d++, _globalThis).Array.prototype && {};
const includes = _includesMaybeArray((a++, b++, c++, _globalThis).Array.prototype || {});
const map = _mapMaybeArray((d++, _globalThis).Array.prototype || {});
export { flat, at, includes, map, a, b, c, d };