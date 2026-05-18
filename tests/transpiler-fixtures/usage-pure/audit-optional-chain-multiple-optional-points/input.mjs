// chain with TWO optional links: `arr?.b?.c.d.includes(2)`. `extractCheck`'s descent
// stops at the FIRST optional link from the outer side (chainStart = `arr?.b`); the
// inner `?.c` is the chain's continuation point. native short-circuits when EITHER
// arr or arr.b is null - both null-check guards must be preserved through deoptionalization
declare const arr: { b?: { c?: { d: number[] } } };
arr?.b?.c.d.includes(2);
