import _Map from "@core-js/pure/actual/map/constructor";
// an assignment-form ctor alias with a LATER user reassignment: the write is not the binding's
// single trusted source, so the registration is refused and the member read stays raw - the
// user's value flows natively (last-write-wins)
let M;
M = _Map;
M = {
  groupBy: () => 'U'
};
export const r = M.groupBy([1], x => x);