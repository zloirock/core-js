import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An array wrapper in a loop initializer preserves the static's result type.
for (const [_ref] = (effect(), [Array]), _ref2 = _ref, make = _Array$from, {
    from: _unused,
    ...rest
  } = _ref2; keepGoing();) {
  var _ref3;
  use(_atMaybeArray(_ref3 = make([1])).call(_ref3, 0), rest);
}