import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// Flatten with a `[Symbol.iterator]` sibling and a direct `globalThis` receiver (no
// alias). The synthesized extraction reuses the original-source receiver slice
// `globalThis`, and the standalone `globalThis -> _globalThis` substitution must reach
// that slice so the emit becomes `_getIteratorMethod(_globalThis)`. If the substitution
// is lost, the extraction calls the unpolyfilled `globalThis` and fails at runtime on
// old engines that lack a native `globalThis` binding.
const from = _Array$from;
const iter = _getIteratorMethod(_globalThis);
console.log(from, iter);