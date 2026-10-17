// arrow expression body variant: nested arrow whose expression body emits a polyfill
// requiring `_ref` (optional-chain safe-call cache). the arrow body wrap (`{ var _ref;
// return EXPR; }`) is anchored at the original-source body span, which sits AFTER a
// `globalThis -> _globalThis` substitution. wrap and substitution splices must apply
// in one descending-order pass to keep both anchors valid against the unmutated source
const { Array: { from } } = globalThis, val = (function () {
  const x = globalThis;
  return (() => arr.flat?.().at)();
})();
console.log(from, val);
