// Multiple instance methods on catch-destructured error: `includes` and `at`.
// emitCatchClause runs for each prop in source order; shared `_ref` via initSrc
// from the first property. Verifies `catch (_ref) { let includes = _includes(_ref);
// let at = _at(_ref); }` emission.
try {
  risky();
} catch ({ includes, at }) {
  includes("k");
  at(0);
}
