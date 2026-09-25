import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// only a spelled-out `void` proves a slot undefined: a bare `undefined` may name a binding - here a
// parameter the caller fills - so pure guards that read on the default, while the `void` slot takes
// the default outright
function pick(undefined) {
  const [A = Array] = [undefined];
  return (A === Array ? _Array$of : A.of.bind(A))(1);
}
export const picked = pick(FakeArray);
const [B = Object] = [void 0];
export const voided = _Object$fromEntries([]);