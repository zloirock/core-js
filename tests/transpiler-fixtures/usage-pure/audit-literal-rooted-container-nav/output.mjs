import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Navigation through a literal resolves the same container as navigation through a name.
// Object, array and class roots retain their global claims and sequence effects.
// A fresh replacement removes the old realm candidate; its URL stays null.
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