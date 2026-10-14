// A static counts present by the data subset as a global does, in pure as in usage-global: excluding its module
// (`Array.from`, left raw) or its constructor's (`Map`, beside the `Map.groupBy` entry pure still serves) only
// stops the build substituting it, so a `||` over the static or its presence test decides and the dead part leaves
// with its import. A static the subset lacks at the mode (`Iterator.range` below `full`) decides nothing.
export const excludedStatic = Array.from || Object.fromEntries(pairs);
export const excludedConstructor = typeof Map.groupBy == 'function' ? 1 : Math.sumPrecise(list);
export const uncarried = Iterator.range || Array.of(item);
