// Catch + mix of polyfillable `at` and non-polyfillable `message`: emitCatchClause
// falls through the `!e` branch for `message`, emitting `let { message } = _ref;`
// separately from the polyfilled `let at = _at(_ref);`.
try {
  risky();
} catch ({ at, message }) {
  at(0);
  message;
}
