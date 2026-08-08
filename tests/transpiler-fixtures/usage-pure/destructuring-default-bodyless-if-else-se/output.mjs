import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
if (cond) {
  sideEffect();
  var from = _Array$from === void 0 ? [] : _Array$from;
} else {
  sideEffect2();
  var of = _Array$of === void 0 ? {} : _Array$of;
}