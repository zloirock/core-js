import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// an IIFE body runs at its position, so the read inside it is straight-line - and the loop that
// re-executes the IIFE carries the array write of the previous iteration into it. the string init
// proves nothing from iteration 2 on, so both families inject; the same IIFE with no loop around it
// keeps the string narrow
let O = 'str';
for (let i = 0; i < 2; i++) {
  (function () {
    return O.at(0);
  })();
  O = [1, 2];
}
let Q = 'str';
(function () {
  return Q.includes('a');
})();
Q = [1, 2];