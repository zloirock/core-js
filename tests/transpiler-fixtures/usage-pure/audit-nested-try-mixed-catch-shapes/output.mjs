import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// outer catch keeps its identifier param `e` untouched; inner catch destructures
// `{ at, includes }` and gets the standard `_ref` rename + per-key extractors. shows
// catch transforms are local to a single CatchClause, no leak across nested try
try {
  outerRisk();
} catch (e) {
  try {
    innerRisk();
  } catch (_ref) {
    let at = _at(_ref);
    let includes = _includes(_ref);
    at(0);
    includes(1);
  }
  e.message;
}