// OptionalCallExpression receiver with a side-effecting block body: same SE-wrap
// path as CallExpression. Member-meta construction accepts both `obj.type === CallExpression`
// AND `OptionalCallExpression`. expected: `k?.()` re-emits at call site, polyfill
// dispatches Promise.resolve - this is the optional-call symmetry probe
let calls = 0;
const k = () => { calls++; return Promise; };
const out1 = k?.().resolve(1);
// pure single-return optional-call: no prefix statement, no SE wrap. resolves
// directly through the inlined call-return expression to Promise; polyfill replaces the
// entire chain. distinct method `.reject` to show this is the no-SE branch
const m = () => Promise;
const out2 = m?.().reject(2);
export { out1, out2, calls };
