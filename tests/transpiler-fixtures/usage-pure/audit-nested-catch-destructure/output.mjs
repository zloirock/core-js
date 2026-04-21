import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Nested try/catch each with destructured params: two independent emitCatchClause
// invocations must not share refs. Inner _ref numbering should cascade (_ref2, _ref3, ...).
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