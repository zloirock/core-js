import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
let avy, fvy, oy;
for (const isFrozen = ({
  Array: {
    [_Symbol$asyncIterator]: avy,
    of: fvy
  }
} = {
  Array: {
    [_Symbol$asyncIterator]: _globalThis.Array[_Symbol$asyncIterator],
    of: _Array$of
  }
}, _Object$isFrozen); !oy;) oy = isFrozen;