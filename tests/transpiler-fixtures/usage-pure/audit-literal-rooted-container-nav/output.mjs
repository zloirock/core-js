import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a member nav whose chain starts at the container LITERAL itself folds into the receiver walk
// exactly as one rooted at a NAME does: the walk descends the literal either way, so the keys in
// front of the container are part of the path rather than a reason to stop. every root the walk can
// stand on reaches - an object literal, an array literal, a class expression's statics, a
// transparent sequence around one, and the literal read with no binding between it and the use.
// the two negatives pin the boundary: an effect in front of the sequence leaves the nav unfoldable
// in both flavors, while a slot this file REPLACED is method-aware like every other written-slot
// consult - pure leaves the read native, global over-injects for it
const obj = {
  h: {
    g: _globalThis
  }
}.h;
hand(_Map);
const box = [{
  g: _globalThis
}][0];
hand(_Set);
const deep = {
  a: {
    b: {
      g: _globalThis
    }
  }
}.a.b;
hand(_WeakMap);
const statics = class {
  static h = {
    g: _globalThis
  };
}.h;
hand(_WeakSet);
const seq = (0, {
  h: {
    g: _globalThis
  }
}).h;
hand(new _Promise(executor));
// no binding at all between the literal and the read
hand(_Reflect);
// the replaced slot: the literal no longer says what `rep.g` holds
const rep = {
  h: {
    g: _globalThis
  }
}.h;
rep.g = {
  URL: null
};
hand(rep.g.URL);
// an effect in front of the sequence changes WHEN the container is built, never WHICH one it is -
// the nav folds through it like its effect-free twin, in the bound spelling and in place alike
const eff = (note(), {
  h: {
    g: _globalThis
  }
}).h;
hand(_Symbol);
hand((note(), {
  h: {
    g: _globalThis
  }
}).h.g.Number);