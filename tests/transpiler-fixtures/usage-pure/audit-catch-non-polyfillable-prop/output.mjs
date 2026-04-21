import _at from "@core-js/pure/actual/instance/at";
// Catch + mix of polyfillable `at` and non-polyfillable `message`: emitCatchClause
// falls through the `!e` branch for `message`, emitting `let { message } = _ref;`
// separately from the polyfilled `let at = _at(_ref);`.
try {
  risky();
} catch (_ref) {
  let at = _at(_ref);
  let {
    message
  } = _ref;
  at(0);
  message;
}