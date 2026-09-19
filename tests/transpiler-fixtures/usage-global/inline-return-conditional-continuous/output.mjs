import "core-js/modules/es.array.of";
// A conditional forwarder preserves the source optional chain boundary.
// The continuous chain skips the static call and its argument when the callee is absent.
let forward;
if (flag) forward = () => ({
  window: {
    Array
  }
});
export const value = forward?.().window.Array.of(observe());