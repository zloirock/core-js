import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// a nav nested in an ARGUMENT keeps its OWN test, and the rows below walk what sits between the two
// reads of the root: nothing, a call, an assignment. no spelling may lift the inner test over the
// call the source wrote - that turns the argument's short-circuit into the whole call's, and where
// the probe is absent the source still evaluates the call with an undefined argument
let hops = 0;
function bump() {
  hops += 1;
  return 0;
}
export const callBetweenRootReads = null == _globalThis.window ? void 0 : _Array$of(bump(), null == _globalThis.window ? void 0 : _Math$trunc(1.5));
export { hops };