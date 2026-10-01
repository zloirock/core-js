// TS type-param with both a constraint and a default: `<T extends object = string[]>() => T`.
// when the call provides no inferable binding, the default (`string[]`) drives the
// return type rather than the much broader constraint (`object`), so `.at(0)` dispatches
// to the array-narrow polyfill instead of falling through to generic
declare function make<T extends object = string[]>(): T;
const xs = make();
xs.at(0);
