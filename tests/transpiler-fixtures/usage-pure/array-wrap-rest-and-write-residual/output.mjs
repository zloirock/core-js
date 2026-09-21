import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
eff('a');
const fromEntries = _Object$fromEntries;
const [{
  Object: {
    fromEntries: _unused,
    ...restA
  }
}] = [_globalThis];
// a verbatim SIBLING keeps it too; a kept write stays in the slot, the extraction stands ahead
const [{
  Object: {
    entries
  },
  other
}] = [(kw = (eff('b'), _globalThis), {
  Object: {
    entries: _Object$entries
  },
  other: _globalThis.other
}), 7];
// the FLAT twins anchor on the hop's own surface, prefix replayed inside, write kept inside
eff('c');
const hasOwn = _Object$hasOwn;
const {
  Object: {
    hasOwn: _unused2,
    ...restB
  }
} = _globalThis;
const keys = _Object$keys;
const {
  Object: {
    keys: _unused3,
    ...restC
  }
} = kw = (eff('d'), _globalThis);
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };