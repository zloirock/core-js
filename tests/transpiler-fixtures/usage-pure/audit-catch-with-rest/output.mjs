import _at from "@core-js/pure/actual/instance/at";
// Catch + rest element: emitCatchClause's hasRest branch renames polyfilled key
// to `_unused` and rebuilds the full pattern. `message` is not polyfilled (no
// instance match on Error instance specifically) so stays in source text.
try {
  risky();
} catch (_ref) {
  let at = _at(_ref);
  let {
    at: _unused,
    ...rest
  } = _ref;
  at(0);
  rest.message;
}