// chain with TWO optional links: `arr?.b?.c.d.includes(2)`. the chain-start descent stops at
// the FIRST optional link from the outer side (`arr?.b`); the inner `?.c` is the continuation
// point. native short-circuits when EITHER arr or arr.b is null - both null-check guards
// must be preserved through deoptionalization.
declare const arr: { b?: { c?: { d: number[] } } };
arr?.b?.c.d.includes(2);
