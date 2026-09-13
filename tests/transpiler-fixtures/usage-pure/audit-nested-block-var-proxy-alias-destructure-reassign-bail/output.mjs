import _globalThis from "@core-js/pure/actual/global-this";
// An array assignment overwrites the block-hoisted realm alias before the static call.
// The initial globalThis is dead: the supplied value owns Promise and allSettled.
function f(src) {
  {
    var g = _globalThis;
  }
  [g] = src;
  g.Promise.allSettled([]);
}
f([]);