import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// Both local and member stores precede every binding from their source initializer.
let held;
if (ready) {
  var before = hit('before');
  held = (hit(typeof from), Array);
  var from = _Array$from;
  var of = _Array$of;
  var after = hit('after');
}
if (ready) {
  var left = hit('left');
  box.value = (hit(typeof keys), Object);
  var keys = _Object$keys;
  var values = _Object$values;
  var right = hit('right');
}
export { held, from, of, keys, values };