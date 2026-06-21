import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// synchronous IIFE bodies usually lift to straight-line (assignments run unconditionally
// before code below), but an assignment behind an inner if / loop / try must block the
// lift - the value may stay at its initial. distinct methods (.at on array-vs-string,
// .includes on string-vs-array) per slot pin emission per line. inner `if` (no braces) and
// inner `while` (braced body) cover both unbraced and braced inner statements.
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