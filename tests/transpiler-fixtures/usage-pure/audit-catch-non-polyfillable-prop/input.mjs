// catch destructure mixes polyfillable `at` with non-polyfillable `message`: `at` is
// extracted via the polyfill helper, `message` keeps its plain destructure read - the
// two emissions stay separate
try {
  risky();
} catch ({ at, message }) {
  at(0);
  message;
}
