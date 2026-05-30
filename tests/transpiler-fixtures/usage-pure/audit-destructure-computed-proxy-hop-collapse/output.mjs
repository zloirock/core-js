import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
const of = _Array$of;
// proxy-global member chain whose intermediate hop is a COMPUTED key (`globalThis['self']`).
// the collapse must recognise the static computed key just like the dotted form and drop it,
// emitting `_globalThis.Array` rather than the runtime-undefined `_globalThis['self'].Array`
const {
  other
} = _globalThis.Array;
of(1, 2);
console.log(other);