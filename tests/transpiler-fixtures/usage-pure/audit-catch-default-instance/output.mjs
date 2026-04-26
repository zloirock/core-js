import _includes from "@core-js/pure/actual/instance/includes";
// catch destructure default `{ includes = alt }`: the polyfill call result is captured
// once into a hoisted temporary, then defaulted - prevents double evaluation of the
// instance helper if the default expression itself has side effects
try {
  risky();
} catch (_ref) {
  var _ref2;
  let includes = (_ref2 = _includes(_ref)) === void 0 ? alt : _ref2;
  includes;
}