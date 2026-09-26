import _includes from "@core-js/pure/actual/instance/includes";
// A preceding native property reads before the extracted getter and its live default.
export function read(receiver, fallback) {
  var _ref2;
  const [_ref] = [receiver];
  const {
    other
  } = _ref;
  const includes = (_ref2 = _includes(_ref)) === void 0 ? fallback() : _ref2;
  return [other, includes];
}