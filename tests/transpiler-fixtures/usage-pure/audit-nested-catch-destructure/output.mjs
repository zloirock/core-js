import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// nested try/catch with destructured catch params at both levels: each catch produces its
// own independent ref binding, with the inner catch's `_ref` getting a cascading suffix
// so the two emissions don't collide
try {
  try {
    inner();
  } catch (_ref) {
    let at = _at(_ref);
    at(0);
  }
} catch (_ref2) {
  let includes = _includes(_ref2);
  includes("x");
}