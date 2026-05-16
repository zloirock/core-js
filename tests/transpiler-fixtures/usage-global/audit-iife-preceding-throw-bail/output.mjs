import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Preceding `if (cond) throw new Error(...)` is an alternative exit shape (vs return)
// that must equally block the straight-line lift. exercises the EXIT_STATEMENT_TYPES
// set covering all four exit kinds (return / throw / break / continue) uniformly.
let x = [];
(() => {
  if (cond) throw new Error('bail');
  x = 'hello';
})();
x.at(-1);