import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an assignment-form ctor alias with a LATER user reassignment: the write is not the binding's
// single trusted source, so the registration is refused and the member read gets the runtime
// ctor guard - at runtime the user's value fails the ctor comparison and the raw branch reads
// the user's own member (last-write-wins, exactly like untranspiled code)
let M;
M = _Map;
M = {
  groupBy: () => 'U'
};
export const r = (M === _Map ? _Map$groupBy : M.groupBy.bind(M))([1], x => x);