import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// an IIFE body runs at its position, so the read inside it is straight-line - and the loop that
// re-executes the IIFE carries the array write of the previous iteration into it. the string init
// proves nothing from iteration 2 on, so both families inject, for a C-style and a for-of loop
// alike; the same IIFE with no loop around it keeps the string narrow
let O = 'str';
for (let i = 0; i < 2; i++) {
  (function () {
    return _at(O).call(O, 0);
  })();
  O = [1, 2];
}
let P = 'str';
for (const step of [1, 2]) {
  (() => _at(P).call(P, step))();
  P = [1, 2];
}
let Q = 'str';
(function () {
  return _includesMaybeString(Q).call(Q, 'a');
})();
Q = [1, 2];