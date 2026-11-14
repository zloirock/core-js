import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  var _ref;
  const effects = [];
  _globalThis.box = choice ? {
    list: [3]
  } : null;
  return typeof (null == (_ref = _globalThis.box) ? void 0 : _getIteratorMethod(_ref.list));
}