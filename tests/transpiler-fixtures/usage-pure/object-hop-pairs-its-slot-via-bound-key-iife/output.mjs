import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A bound computed hop key keeps its source meaning when the IIFE parameter moves to the body.
const hopKey = 'w';
const viaBoundKeyIife = (_ref => {
  let m = _atMaybeArray(_ref.w);
  return m;
})({
  w: [1, 2]
});
export default [viaBoundKeyIife];