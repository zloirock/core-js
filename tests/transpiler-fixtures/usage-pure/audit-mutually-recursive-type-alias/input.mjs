// mutually-recursive type aliases — `followTypeAliasChain` must bail on cycle
// without exhausting MAX_DEPTH (memory waste on subst Map per iteration)
type A = B;
type B = A;
declare const x: A;
const r = (x as any).at(0);
globalThis.__r = r;
