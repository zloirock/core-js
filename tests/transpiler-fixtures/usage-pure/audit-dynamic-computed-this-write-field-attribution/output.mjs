import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a computed `this`-write names a field only by its STATIC key. a dynamic key (`this[a]`, an
// identifier) names the field by the variable's runtime VALUE, not its name - so the array field
// keeps its narrow even when the variable matches the field name. a string-literal key (`this['b']`)
// and a single-quasi template key (`this[`c`]`) are STATIC names that really write - and widen -
// those fields, read back as the generic helper. separate fields keep the flows independent;
// distinct methods / imports trace each line.
class Dynamic {
  a = [1, 2, 3];
  b = [4, 5, 6];
  c = [7, 8, 9];
  dyn(a) {
    var _ref;
    this[a] = "x";
    return _atMaybeArray(_ref = this.a).call(_ref, 0);
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