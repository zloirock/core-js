import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Unserved slots keep their native read; a null receiver rejects before the pattern key.
export function optional({
  [(effect(), 'of')]: of,
  length
} = function (_ref) {
  return null == _ref ? _ref : {
    "of": _Array$of,
    get length() {
      return _ref.length;
    }
  };
}(null == _globalThis.window ? void 0 : _self.Array)) {
  return [of, length];
}
export function optedOut({
  from,
  // core-js-disable-next-line
  of
} = (Array, {
  from: _Array$from,
  // core-js-disable-next-line
  get of() {
    // core-js-disable-next-line
    return Array.of;
  }
})) {
  return [from, of];
}
// The instance dispatcher and the retained length share one evaluated array.
const key = 'length';
export function instance({
  at,
  [key]: length
} = function (_ref2) {
  return null == _ref2 ? _ref2 : {
    at: _atMaybeArray(_ref2),
    get [key]() {
      return _ref2[key];
    }
  };
}([7])) {
  return [at, length];
}