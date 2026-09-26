import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A named object key selects an array before native iteration selects its receiver.
// Preserve both selections and inject the instance method for the captured value.
const {
  w: _ref
} = {
  w: [[4, 8]]
};
const [_ref2] = _ref;
const at = _atMaybeArray(_ref2);
export { at };