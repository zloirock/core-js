// `resolveObjectName` inline-call recursion has a single-hop ceiling: the immediate
// callee body must resolve to a global / polyfill identifier directly. A double-arrow
// `(()=>()=>X)()` bottoms out on the inner ArrowFunctionExpression which is not a
// resolvable receiver, so the static `.resolve` cannot be attributed to Promise.
// The binding-chained shape `outer = () => inner(); inner = () => Promise` DOES
// resolve via the Identifier-binding hop in `resolveBindingToGlobal`, because each
// step reduces to an Identifier the binding walker can resolve. Lock both shapes
// side-by-side: bail (generic dispatch) vs resolve (Promise-attributed import)
const r1 = (() => () => Promise)()().resolve(1);
const inner = () => Promise;
const outer = () => inner();
const r2 = outer().resolve(2);
export { r1, r2 };
