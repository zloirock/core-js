import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Native fragments retain their keys, defaults and nested patterns around a positional read.
export function read(rows, key, fallback) {
  var _ref2;
  const [_ref] = rows;
  const {
    [key]: other = fallback(),
    nested: {
      value
    }
  } = _ref;
  const at = _at(_ref);
  const includes = (_ref2 = _includes(_ref)) === void 0 ? fallback() : _ref2;
  return [other, value, at, includes];
}