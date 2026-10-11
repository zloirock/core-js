// a realm selection beside a container arm reads either: the realm's constructor and the container's
// slot each inject their static, in either arm order and under `||`. a container the realm left
// always decides never runs
export const { Map: { groupBy } } = c ? globalThis : { Map: Object };
export const { Math: { isInteger } } = c ? { Math: Number } : globalThis;
export const { Array: { fromEntries } } = (d && globalThis) || { Array: Object };
export const { Reflect: { entries } } = globalThis || { Reflect: Object };
