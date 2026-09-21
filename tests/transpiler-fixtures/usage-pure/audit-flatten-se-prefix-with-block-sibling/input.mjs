// An initializer effect runs before its static binding and before the following function.
// The function keeps its own instance polyfill and local temporary.
declare function logCall(): void;
const { Array: { from } } = (logCall(), globalThis), kls = (() => {
  return [].values();
})();
export { from, kls };
