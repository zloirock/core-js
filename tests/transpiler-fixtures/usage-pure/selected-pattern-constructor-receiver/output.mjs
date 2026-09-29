import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Pair the pattern with both selected sources: a user slot and the realm constructor.
// The user method is preserved, and only the realm branch needs the static polyfill.
function read(flag) {
  var _ref;
  let C;
  const own = {
    Map: {
      groupBy: 9
    }
  };
  const source = (_ref = flag ? own : _globalThis, C = _ref === _globalThis ? _Map : _ref["Map"], _ref);
  return [source === (flag ? own : _globalThis), typeof (C === _Map ? _Map$groupBy : C.groupBy)];
}
export const result = [read(true), read(false)];