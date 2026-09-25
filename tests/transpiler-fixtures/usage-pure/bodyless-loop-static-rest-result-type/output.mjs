import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A relocated head keeps its scope and the extracted static's result type.
for (const _ref of [Array]) {
  var _ref3;
  let _ref2 = _ref,
    make = _Array$from,
    {
      from: _unused,
      ...rest
    } = _ref2;
  use(_atMaybeArray(_ref3 = make([1, 2])).call(_ref3, -1), rest);
}