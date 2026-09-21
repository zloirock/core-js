import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Set from "@core-js/pure/actual/set";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Known static slots and computed symbol keys receive their own pure entries.
// Constructor rest reads the symbol slot and remaining keys from the full index.
const a = _getIteratorMethod(_globalThis.Array);
a;
const m = _getIteratorMethod(_Map);
m;
const {
  Object: {
    [_Symbol$iterator]: o,
    fromEntries: fe
  }
} = {
  Object: {
    [_Symbol$iterator]: _getIteratorMethod(_globalThis.Object),
    fromEntries: _Object$fromEntries
  }
};
o;
fe(x);
const {
  Set: {
    [_Symbol$iterator]: s,
    ...ri
  }
} = {
  Set: _Set
};
s;
ri;