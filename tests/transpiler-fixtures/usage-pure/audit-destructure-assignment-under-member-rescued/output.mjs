import _globalThis from "@core-js/pure/actual/global-this";
// A store beneath an array element's member read remains in that source expression.
// The wrapper keeps its native from read and the realm reference still receives its polyfill.
let a;
const [{
  from
}] = [(a = _globalThis).Array];