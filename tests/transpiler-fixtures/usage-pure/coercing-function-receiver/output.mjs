import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Coercion can invoke a private writer while a getter selects the method.
// The call retains the receiver selected before that writer changes its binding.
export function read() {
  var _ref;
  const held = ['held'];
  let rows = held;
  function write() {
    rows = ['other'];
  }
  Object.defineProperty(held, 'at', {
    get() {
      void (write + 0);
      return function (index) {
        return this[index];
      };
    }
  });
  return _atMaybeArray(_ref = rows).call(_ref, 0);
}