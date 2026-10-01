import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Array evaluation finishes before the nested object read.
const [_ref] = [{
  a: record("init"),
  y: [1, [2]]
}, record("rhs")];
const {
  a
} = _ref;
const flat = _flatMaybeArray(_ref.y);
export { a, flat };