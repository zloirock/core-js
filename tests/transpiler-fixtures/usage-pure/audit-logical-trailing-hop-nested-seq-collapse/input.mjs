// A `{ method } = X || fallback` destructure whose operand X is a proxy-global chain wrapped in NESTED
// sequences AND carrying a TRAILING redundant hop (`(c++, (d++, globalThis.self)).window.Array.prototype`)
// must collapse the whole proxy navigation to the root with its buried side effects in source order. the
// prior per-shape boundary math sliced from the bare-identifier start (INSIDE the parens) and cut across
// the nested `))`, emitting unbalanced parens - an unparsable build-break; the unified reconstruction spans
// the whole navigation and harvests every prefix recursively. lines vary by OPERATOR, nesting DEPTH and hop
// count, each binding a DISTINCT method; the trailing counters prove the buried effects run in source order.
let a = 0, b = 0, c = 0, d = 0;
const { flat } = (c++, (d++, globalThis.self)).window.Array.prototype || {};
const { at } = (c++, (d++, globalThis.self)).window.Array.prototype && {};
const { includes } = (a++, (b++, (c++, globalThis.self))).self.window.Array.prototype || {};
const { map } = (d++, globalThis.self).Array.prototype || {};
export { flat, at, includes, map, a, b, c, d };
