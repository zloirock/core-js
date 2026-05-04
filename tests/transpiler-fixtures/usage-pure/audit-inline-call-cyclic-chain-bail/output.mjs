// cyclic alias chain: a() -> b() -> a(). recursive descent must not loop forever -
// `seen` Set tracks binding names already in the resolution chain; second visit to `a`
// short-circuits to null. without cycle guard, recursion would stack-overflow. fixture
// confirms safe bail (no SE detected, polyfill emission falls back to runtime behavior)
const a = () => b();
const b = () => a();
const out = a().resolve(1);
export { out };