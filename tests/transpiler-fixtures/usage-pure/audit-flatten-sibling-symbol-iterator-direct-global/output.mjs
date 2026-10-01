import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// flatten with a `[Symbol.iterator]` sibling and a direct `globalThis` receiver (no
// alias). the synthesized extraction reuses the source receiver slice `globalThis`, and
// the `globalThis -> _globalThis` substitution must reach it so the emit becomes
// `_getIteratorMethod(_globalThis)` - else it calls an unpolyfilled `globalThis` on old engines
const {
  Array: {
    from
  },
  [_Symbol$iterator]: iter
} = {
  Array: {
    from: _Array$from
  },
  [_Symbol$iterator]: _getIteratorMethod(_globalThis)
};
console.log(from, iter);