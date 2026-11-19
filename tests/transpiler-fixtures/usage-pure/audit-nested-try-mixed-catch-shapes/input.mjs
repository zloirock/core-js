// outer catch keeps its identifier param `e` untouched; inner catch destructures
// `{ at, includes }` and gets the standard `_ref` rename + per-key extractors. shows
// catch transforms are local to a single CatchClause, no leak across nested try
try {
  outerRisk();
} catch (e) {
  try {
    innerRisk();
  } catch ({ at, includes }) {
    at(0);
    includes(1);
  }
  e.message;
}
