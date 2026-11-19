import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// the switch DISCRIMINANT is evaluated in the enclosing environment, so a case-level lexical - a
// function declaration too, block-scoped in strict code - does not cover it, while a `var` in the
// same case does - it hoists to the function scope. the third and sixth lines read inside the case
// under its own shadow and the fourth has no shadow at all; one family per line so a lost decision
// shows up in the import set.
switch (_Object$entries({
  a: 1
}).length) {
  case 1:
    let Object = 1;
    break;
}
switch (Reflect.ownKeys({
  b: 2
}).length) {
  case 1:
    var Reflect = 1;
    break;
}
switch (0) {
  case 1:
    let Set = 1;
    new Set([1]);
    break;
}
switch (0) {
  case 1:
    _Promise$allSettled([]);
    break;
}
switch (_Math$trunc(1.5)) {
  case 1:
    function Math() {}
    break;
}
switch (0) {
  case 1:
    function WeakMap() {}
    new WeakMap();
    break;
}