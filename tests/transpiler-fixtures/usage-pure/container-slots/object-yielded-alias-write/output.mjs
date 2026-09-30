import _Map from "@core-js/pure/actual/map/constructor";
// A yielded container reaches a loop binding that writes its constructor slot.
const escapedByYieldedArgument = function () {
  function* hand(value) {
    yield value;
  }
  const yieldBox = {
    k: Object
  };
  for (const y of hand(yieldBox)) y.k = _Map;
  const {
    k: {
      setPrototypeOf
    }
  } = yieldBox;
  return setPrototypeOf;
}();
export { escapedByYieldedArgument };