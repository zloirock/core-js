import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A fresh replacement removes the old realm candidate in either flavor.
// This also holds for bindings reached through object, array and class literals.
// Writes to unrelated keys leave the original global claims intact.
const obj = {
  h: {
    g: _globalThis
  }
}.h;
obj.g = {
  Map: null
};
hand(obj.g.Map);
const box = [{
  g: _globalThis
}][0];
box.g = {
  Set: null
};
hand(box.g.Set);
const statics = class {
  static h = {
    g: _globalThis
  };
}.h;
statics.g = {
  WeakMap: null
};
hand(statics.g.WeakMap);
// `kept.h` is the literal's own key, above the name - the read never goes through it
const kept = {
  h: {
    g: _globalThis
  }
}.h;
kept.h = elsewhere;
hand(_WeakSet);
// an unrelated slot on the very container the read descends
const aside = {
  h: {
    g: _globalThis
  }
}.h;
aside.tag = 1;
hand(_Promise);