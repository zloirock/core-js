import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an alias write hosted INSIDE a decorator expression: the decorator subtree is outside the
// default estree visitor keys, so the pre-pass dispatches over it explicitly (parity with
// babel's native traverse). the placement is expression-nested - flow-trust refused, the
// member read gets the runtime ctor guard
let M;
function dec(x) {
  return v => v;
}
@(dec(({ Map: M } = _globalThis)))
class C {}
export const r = typeof (M === _Map ? _Map$groupBy : M.groupBy);