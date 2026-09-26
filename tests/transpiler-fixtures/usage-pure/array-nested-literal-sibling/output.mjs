import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Array evaluation finishes before the nested object read.
const [_ref] = [{
  a: record("init"),
  y: [1, [2]]
}, record("rhs")];
const _ref2 = _ref;
const {
  a
} = _ref2;
const flat = _flatMaybeArray(_ref2.y);
export { a, flat };