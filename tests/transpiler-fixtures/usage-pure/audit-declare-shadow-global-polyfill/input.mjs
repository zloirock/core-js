// `declare const Set: ...` is a TS-ONLY ambient declaration: the binding exists at compile time
// but tsc elides it; at runtime `Set` IS the global. `scope.getBinding` returns the declare
// binding either way, so the shadow check must filter ambient bindings, else Set is misclassified
// as user-shadowed and `new Set()` collapses to the un-polyfilled identifier (fails off-engine)
declare const Set: { new<T>(): { size: number; has(v: T): boolean } };
const s = new Set<number>();
s.has(1);
