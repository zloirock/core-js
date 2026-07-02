import _globalThis from "@core-js/pure/actual/global-this";
// an alias write hosted INSIDE a decorator expression: the decorator subtree is outside the
// default estree visitor keys, so the pre-pass dispatches over it explicitly (parity with
// babel's native traverse). the placement is expression-nested - flow-trust refused, the member
// read stays raw
let M;
function dec(x) {
  return v => v;
}
@dec({
  Map: M
} = _globalThis)
class C {}
export const r = typeof M.groupBy;