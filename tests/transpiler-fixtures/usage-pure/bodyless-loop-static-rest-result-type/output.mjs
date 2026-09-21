import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A relocated head keeps its scope and the extracted static's result type.
for (const _ref of [Array]) {
  var _ref2;
  let make = _Array$from;
  let {
    from: _unused,
    ...rest
  } = _ref;
  use(_atMaybeArray(_ref2 = make([1, 2])).call(_ref2, -1), rest);
}