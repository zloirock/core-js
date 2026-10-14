import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// a call of a class's static method returns what its one return names, as a literal method's call does:
// a static read off the result resolves through it in both emitters, the call kept for its effects
class Pick {
  static list() {
    return Array;
  }
}
const Measure = class {
  static math() {
    return Math;
  }
};
const Box = {
  list() {
    return Array;
  }
};
export const list = (Pick.list(), _Array$from)('ab');
export const cut = (Measure.math(), _Math$trunc)(1.5);
export const single = (Box.list(), _Array$of)(1);