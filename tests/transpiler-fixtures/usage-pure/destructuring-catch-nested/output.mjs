import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
try {} catch (_ref) {
  let includes = _includes(_ref);
  includes("x");
  try {} catch (_ref2) {
    let at = _at(_ref2);
    at(-1);
  }
}