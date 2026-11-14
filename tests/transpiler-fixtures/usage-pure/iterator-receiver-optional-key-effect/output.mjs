import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  var _ref;
  const effects = [];
  _globalThis.box = choice ? {
    list: [3]
  } : null;
  return null == (_ref = _globalThis.box) ? void 0 : _getIterator(_ref[_pushMaybeArray(effects).call(effects, "key"), "list"]).next().value;
}