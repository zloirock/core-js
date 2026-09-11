import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// a `?.` over a run whose unbacked tail stands TERMINAL in the value the SOURCE reads is
// load-bearing: the run rides above and keeps its slot over the deepest span pure can back
// (`globalThis.self?.window` is `_self.window`), so the read answers what the environment holds.
// folding it handed every host the always-defined realm object instead
export const plainRead = _self.window;
export const typeofRead = typeof _self.window;
export const inAnArray = [_self.window].length;

// NEGATIVE: a claim reading THROUGH the run consumes it, so the probe folds onto the ponyfill
export const readThrough = _Array$from([1]);