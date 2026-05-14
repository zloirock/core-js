import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// Synchronous IIFE bodies usually lift to straight-line: their assignments run
// unconditionally before code below. but if the assignment itself sits behind an inner
// if / loop / try inside the IIFE, lift must bail - the value may stay at its initial.
// distinct methods (.at on array-vs-string, .includes on string-vs-array) per slot pin
// emission per line. inner `if` (no braces) and inner `while` (braced loop body) ensure
// both unbraced and braced inner statements are covered.
function demo(cond) {
  let x = [];
  (() => {
    if (cond) x = "hello";
  })();
  x.at(-1);
  let y = "x";
  (() => {
    while (cond) {
      y = [1, 2];
    }
  })();
  y.includes(2);
}
demo(true);
demo(false);