import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A dynamic key may overwrite any field. Literal and template keys can only overwrite their named field.
class Dynamic {
  a = [1, 2, 3];
  dyn(key) {
    var _ref;
    this[key] = "x";
    return _at(_ref = this.a).call(_ref, 0);
  }
}
class Literal {
  b = [4, 5, 6];
  lit() {
    var _ref2;
    this["b"] = "x";
    return _includes(_ref2 = this.b).call(_ref2, "x");
  }
}
class Template {
  c = [7, 8, 9];
  tpl() {
    var _ref3;
    this[`c`] = "x";
    return _at(_ref3 = this.c).call(_ref3, 0);
  }
}
class Static {
  items = [1, 2, 3];
  read() {
    var _ref4;
    return _atMaybeArray(_ref4 = this.items).call(_ref4, 0);
  }
}
const d = new Dynamic();
export const x = [d.dyn(0), d.dyn("a")];
export const y = new Literal().lit();
export const z = new Template().tpl();
export const kept = new Static().read();