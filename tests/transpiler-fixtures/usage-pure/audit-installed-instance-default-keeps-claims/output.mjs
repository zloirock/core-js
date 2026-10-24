import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// An installed parameter default keeps both instance claims on the value written by the default.
let installed;
function read(first = 0, {
  at,
  flat
} = (_ref => {
  return _ref == null ? _ref : {
    get at() {
      return _atMaybeArray(_ref);
    },
    get flat() {
      return _flatMaybeArray(_ref);
    }
  };
})(installed = [1]), last = 0) {
  return [first, at, flat, last];
}
const result = read(effect(), undefined, effect());
export { installed, result };