import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _self from "@core-js/pure/actual/self";
// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  return (({
    entries,
    other
  }) => [typeof entries, typeof other])(function (_ref) {
    return null == _ref ? void 0 : {
      entries: _Object$entries,
      get other() {
        return _ref.other;
      }
    };
  }(null == _globalThis.window ? void 0 : _self.Object));
}