import "core-js/modules/es.array.of";
// A conditionally installed forwarder can expose the literal constructor.
// Inject its static while leaving the original optional chain and argument evaluation intact.
let forward;
if (flag) forward = () => ({
  window: {
    Array
  }
});
export const value = forward?.()?.window?.Array.of(observe());