// array-pattern rest binding `...rest` followed by an instance call: `rest` is always
// an array, so the rewrite picks the array-specific pure-mode instance polyfill.
const [...rest] = [1, 2, 3];
rest.at(0);
