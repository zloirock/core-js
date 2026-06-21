import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// flatten with a `[Symbol.iterator]` sibling and a direct `globalThis` receiver (no
// alias). the synthesized extraction reuses the source receiver slice `globalThis`, and
// the `globalThis -> _globalThis` substitution must reach it so the emit becomes
// `_getIteratorMethod(_globalThis)` - else it calls an unpolyfilled `globalThis` on old engines
const from = _Array$from;
const iter = _getIteratorMethod(_globalThis);
console.log(from, iter);