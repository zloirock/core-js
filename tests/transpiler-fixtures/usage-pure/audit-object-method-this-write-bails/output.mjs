import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// a module-local object literal narrows its field from the init value ONLY while no channel
// can rewrite the field: an own method assigning `this.<field>` retypes it on ANY later call,
// whether invoked directly or through an extracted function value
const boxed = {
  data: [1, 2]
};
export const viaPlainField = _atMaybeArray(_ref = boxed.data).call(_ref, 0);
const swapped = {
  data: [3, 4],
  swap() {
    this.data = "xy";
  }
};
swapped.swap();
export const viaMethodWrite = _includes(_ref2 = swapped.data).call(_ref2, 5);
const pulled = {
  data: [6, 7],
  flip() {
    this.data = "z";
  }
};
const m = pulled.flip;
m.call(pulled);
export const viaExtractedWrite = _at(_ref3 = pulled.data).call(_ref3, 1);