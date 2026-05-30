// optional chain whose first two hops are BOTH optional (`arr?.flat()?.flatMap(...)`) before a
// non-optional tail. the outer transform folds the consecutive `?.` leads into its receiver and
// keeps none of the tail's dots optional. compose must locate each inner needle against that
// partially-deoptionalized receiver instead of re-stripping the surviving structural dots
const r = arr?.flat()?.flatMap(f).at(0).includes(1);
