// IIFE returns a parameter named `globalThis` that shadows the proxy-global; outer
// `.Array.from(...)` chain must NOT be polyfilled (negative control).
function f(globalThis) {
  return (() => globalThis)().Array.from([1]);
}
f({ Array: { from: x => x } });
