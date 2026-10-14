// A static counts present by the data subset as a global does: excluding its module (`Array.from`) or its
// constructor's (`Map`, beside the `Map.groupBy` module the build still loads) only stops the build loading it,
// so a `||` over the static or its presence test decides and the dead part loads nothing. A static the subset
// lacks at the mode (`Iterator.range` below `full`) decides nothing: the right keeps its module (`Array.of`).
export const excludedStatic = Array.from || Object.fromEntries(pairs);
export const excludedConstructor = typeof Map.groupBy == 'function' ? 1 : Math.sumPrecise(list);
export const uncarried = Iterator.range || Array.of(item);
