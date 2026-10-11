// a `var` alias read before its initializer ran, or under a branch that may skip it, holds `undefined`
// there: the `||` over it runs its fallback, whose static is injected too. usage-global only: the pure
// flavor guards the selection either way
export const early = (M || Object).groupBy(list, key);
var M = Map;
if (c) { var I = Iterator; }
export const skipped = (I || Array).from(list);
