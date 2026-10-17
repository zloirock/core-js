import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
import "core-js/modules/web.self";
// a nav nested in an ARGUMENT keeps its OWN test, and the rows below walk what sits between the two
// reads of the root: nothing, a call, an assignment. no spelling may lift the inner test over the
// call the source wrote - that turns the argument's short-circuit into the whole call's, and where
// the probe is absent the source still evaluates the call with an undefined argument
let hops = 0;
export const assignBetweenRootReads = globalThis.window?.self.Array.of(hops = 1, globalThis.window?.self.Math.trunc(2.5));
export { hops };