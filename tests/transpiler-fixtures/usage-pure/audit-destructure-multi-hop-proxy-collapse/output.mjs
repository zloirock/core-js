import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
const of = _Array$of;
// proxy-global chain with TWO intermediate hops (`globalThis.self.window.Array`). every proxy
// hop between the root and the constructor leaf must COLLAPSE, leaving `_globalThis.Array`
const {
  other
} = _globalThis.Array;
of(1, 2);
console.log(other);