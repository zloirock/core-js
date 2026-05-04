// cyclic alias chains. resolveInlineCalleeFunction tracks identifier hops in `seen` so a
// chain that bottoms out on itself can't recurse forever and stack-overflow.
//
// shape A - direct self-call cycle: f() -> f(); receiver never resolves, no rewrite.
// note that singleReturnBodyExpression of `() => f()` returns the inner CallExpression `f()`,
// resolveObjectName recurses into inlineCallReturnExpression with the SAME seen Set carrying
// `f`, the cycle guard fires (seen.has('f')) and resolution returns null
const f = () => f();
const r1 = f().resolve(1);
// shape B - two-step cycle: g() -> h() -> g(); receiver never resolves
const g = () => h();
const h = () => g();
const r2 = g().reject(2);
// shape C - three-step cycle: p() -> q() -> r() -> p(); receiver never resolves
const p = () => q();
const q = () => r();
const r = () => p();
const r3 = p().any([]);
export { r1, r2, r3 };