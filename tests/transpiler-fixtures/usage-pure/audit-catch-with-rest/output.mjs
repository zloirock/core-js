import _at from "@core-js/pure/actual/instance/at";
// catch destructure with rest element: polyfilled keys are renamed to `_unused` and the
// pattern is rebuilt around them. `message` is not polyfilled (no instance match on the
// Error shape) and is left in source text
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