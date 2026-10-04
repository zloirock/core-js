import "core-js/modules/es.array.at";
// Coercion can invoke a private writer while a getter selects the method.
// The call retains the receiver selected before that writer changes its binding.
export function read() {
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
  return rows.at(0);
}