import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a computed `this`-write names a field only by its STATIC key. a DYNAMIC key (`this[a]`, an
// identifier) resolves to whatever the variable holds at runtime - including the name of any
// field on this class - so it poisons the whole surface: no per-field initializer narrow can
// survive it, and every read falls back to the generic helper. a string-literal key
// (`this['b']`) and a single-quasi template key (`this[`c`]`) name ONE field each and widen
// only that one. separate fields keep the flows independent; distinct methods / imports trace
// each line.
class Dynamic {
  a = [1, 2, 3];
  b = [4, 5, 6];
  c = [7, 8, 9];
  dyn(a) {
    var _ref;
    this[a] = "x";
    return _at(_ref = this.a).call(_ref, 0);
  }
  lit() {
    var _ref2;
    this["b"] = "x";
    return _includes(_ref2 = this.b).call(_ref2, 0);
  }
  tpl() {
    var _ref3;
    this[`c`] = "x";
    return _at(_ref3 = this.c).call(_ref3, 0);
  }
}
const d = new Dynamic();
export const x = d.dyn(0);
export const y = d.lit();
export const z = d.tpl();
// a class WITHOUT any dynamic write keeps its per-field narrow - the poison is per-surface,
// not global
class Static {
  items = [1, 2, 3];
  read() {
    var _ref4;
    return _atMaybeArray(_ref4 = this.items).call(_ref4, 0);
  }
}
export const kept = new Static().read();