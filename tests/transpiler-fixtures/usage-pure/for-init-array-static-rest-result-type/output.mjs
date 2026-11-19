import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An array wrapper in a loop initializer preserves the static's result type.
for (const [_ref] = (effect(), [Array]), make = _Array$from, {
    from: _unused,
    ...rest
  } = _ref; keepGoing();) {
  var _ref2;
  use(_atMaybeArray(_ref2 = make([1])).call(_ref2, 0), rest);
}