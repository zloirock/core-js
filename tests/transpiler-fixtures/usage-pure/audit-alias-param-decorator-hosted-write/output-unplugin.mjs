import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a ctor-alias write hosted inside a constructor PARAM-PROPERTY's legacy decorator: @babel/types
// omits `decorators` from TSParameterProperty's visitor keys, so the ctor-alias pre-pass (and the
// main traversal) must requeue the decorator explicitly or the write goes unregistered - babel then
// left the member read native while the estree side (pristine AST) folded it. the decorator argument
// runs at class-definition time on an unknown call, so flow-trust is refused and the read gets the
// runtime ctor guard - the same placement verdict as a class-decorator-hosted write
function dec(v) {
  return () => {};
}
let M;
class C {
  constructor(@dec(({ Map: M } = _globalThis)) private x) {}
}
export const viaParamProperty = () => (M === _Map ? _Map$groupBy : M.groupBy.bind(M))([1, 2], y => y % 2);