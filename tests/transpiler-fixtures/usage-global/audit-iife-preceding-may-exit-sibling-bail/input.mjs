// Preceding-sibling may-exit inside an IIFE body must BLOCK the straight-line lift.
// `(() => { if (cond) return; x = 'hello'; })()` does NOT unconditionally rebind x:
// when `cond` is truthy the return fires and x stays bound to its outer init `[]`.
// without the preceding-siblings exit check, the lift narrows the use site to string
// only (suppressing `array.at`), which crashes at runtime when cond happens to be truthy
// in an engine without native Array.prototype.at.
let x = [];
(() => {
  if (cond) return;
  x = 'hello';
})();
x.at(-1);
