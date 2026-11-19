import "core-js/modules/es.array.of";
// A conditional forwarder preserves the source optional chain boundary.
// The sealed value throws at the following property read before evaluating the argument.
let forward;
if (flag) forward = () => ({
  window: {
    Array
  }
});
export const value = (forward?.()?.window).Array.of(observe());