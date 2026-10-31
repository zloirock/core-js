import _at from "@core-js/pure/actual/instance/at";
// catch destructure mixes polyfillable `at` with non-polyfillable `message`: `at` is
// extracted via the polyfill helper, `message` keeps its plain destructure read - the
// two emissions stay separate
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