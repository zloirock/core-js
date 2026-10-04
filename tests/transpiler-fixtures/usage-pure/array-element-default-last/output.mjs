import _includes from "@core-js/pure/actual/instance/includes";
// A preceding native property reads before the extracted getter and its live default.
export function read(receiver, fallback) {
  var _ref;
  const [,] = [receiver];
  const {
    other
  } = receiver;
  const includes = (_ref = _includes(receiver)) === void 0 ? fallback() : _ref;
  return [other, includes];
}