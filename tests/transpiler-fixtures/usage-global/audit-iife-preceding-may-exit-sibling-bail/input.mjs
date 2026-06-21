// a may-exit preceding sibling inside an IIFE body must BLOCK the straight-line lift.
// `(() => { if (cond) return; x = 'hello'; })()` does NOT unconditionally rebind x:
// when `cond` is truthy the return fires and x stays bound to its outer init `[]`.
// without that check the lift narrows the use site to string only (suppressing `array.at`),
// which crashes at runtime when cond is truthy in an engine lacking Array.prototype.at.
let x = [];
(() => {
  if (cond) return;
  x = 'hello';
})();
x.at(-1);
