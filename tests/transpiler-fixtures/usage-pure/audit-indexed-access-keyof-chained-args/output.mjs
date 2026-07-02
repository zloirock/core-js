import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// chained `Items[K1][K2]` with both index nodes typeparam-bound at the call site. each
// arg-literal index hop rewrites independently, then re-folding the indexed access rebuilds
// the outer-first nodes into the chained AST so the dispatcher walks two hops
// (`Items['a']` -> `{x:string[]}` -> `['x']`) to land on string[]. without per-hop
// rewrite either slot stays a typeparam ref and the chain bails to undecidable
type Items = {
  a: {
    x: string[];
    y: number[];
  };
  b: {
    z: boolean[];
  };
};
declare function pick<K1 extends keyof Items, K2 extends keyof Items[K1]>(k1: K1, k2: K2): Items[K1][K2];
_atMaybeArray(_ref = pick('a', 'x')).call(_ref, 0);