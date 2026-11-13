import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
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
export function instance(_ref2 = [7]) {
  let at = _at(_ref2);
  let {
    ["length"]: length
  } = _ref2;
  return [at, length];
}