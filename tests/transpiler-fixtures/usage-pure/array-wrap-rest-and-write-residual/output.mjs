import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A static extracted beside an object rest or a sibling keeps its initializer's effects and writes:
// a bare effect prefix runs first as a statement of its own, while a write stays where the source
// wrote it - in the wrapper's slot, which then hands the claim and its sibling a literal of their
// own, or in the residual's initializer. The flat forms are the twins the wrapped rows answer to.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let kw;
eff('a');
const fromEntries = _Object$fromEntries;
const [{
  Object: {
    fromEntries: _unused,
    ...restA
  }
}] = [_globalThis];
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
eff('c');
// the flat twins: the bare prefix runs first, the write stays in the residual's initializer
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