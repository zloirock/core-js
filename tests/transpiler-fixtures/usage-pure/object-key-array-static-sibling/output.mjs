import _Math$sign from "@core-js/pure/actual/math/sign";
// The object key and native array iteration select a static receiver once.
// The static getter remains ahead of its binding and the neighbouring element binding.
const held = {
  k: [Math]
};
const {
  k: [_ref, _ref2]
} = held;
const {
  sign: _unused
} = _ref;
const sign = _Math$sign;
const tail = _ref2;
export { sign, tail };