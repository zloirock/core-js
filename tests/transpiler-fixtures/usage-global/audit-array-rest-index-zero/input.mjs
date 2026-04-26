// array-pattern rest binding `...rest` followed by `.at(0)` instance call: `rest` is
// always an array, so the rewrite picks the array-specific instance polyfill.
const [...rest] = [1, 2, 3];
rest.at(0);
