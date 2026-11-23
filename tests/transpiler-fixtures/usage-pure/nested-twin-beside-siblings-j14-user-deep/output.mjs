import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const deep = {
  y: {
    z: [1]
  }
};
const {
    y: _ref
  } = deep,
  {
    z: _ref2
  } = _ref,
  userDeep = _atMaybeArray(_ref2),
  {
    other: o5
  } = _ref2,
  {
    junk: j14
  } = _ref;
export { userDeep };
export { o5 };
export { j14 };