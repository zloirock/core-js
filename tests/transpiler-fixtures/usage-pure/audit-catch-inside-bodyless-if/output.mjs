import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Catch inside bodyless `if` - single-statement body is a block `{}`, so there is no
// scope escape. Confirm destructuring extraction still works.
if (cond) try {} catch (_ref) {
  let at = _at(_ref);
  let flat = _flatMaybeArray(_ref);
  at(0);
  flat();
}