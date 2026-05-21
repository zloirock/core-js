// chained `Items[K1][K2]` with both indexNodes typeparam-bound at the call site. each
// indexFromArgLiteral hop rewrites independently, then rebuildIndexedAccess re-folds
// the outer-first nodes into the chained AST so the dispatcher walks two hops
// (`Items['a']` -> `{x:string[]}` -> `['x']`) to land on string[]. without per-hop
// rewrite either slot stays a typeparam ref and the chain bails to undecidable
type Items = { a: { x: string[]; y: number[] }; b: { z: boolean[] } };
declare function pick<K1 extends keyof Items, K2 extends keyof Items[K1]>(k1: K1, k2: K2): Items[K1][K2];
pick('a', 'x').at(0);
