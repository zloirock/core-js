import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$keys from "@core-js/pure/actual/object/keys";
// what an array wrapper leaves behind when the claim is a receiver-less static and a REST or a
// verbatim sibling keeps the residual, one spelling on both legs: the element's own PREFIX lifts
// ahead of the extraction, a kept WRITE stays in that residual (the source performs it there,
// and nothing reads it twice), and the flat twins anchor on the hop's own surface
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
// an INNER rest keeps the residual; the element's prefix lifts and the slot reads the quiet tail
eff('a');
const fromEntries = _Object$fromEntries;
const [{
  Object: {
    fromEntries: _unused,
    ...restA
  }
}] = [_globalThis];
// a verbatim SIBLING keeps it too; a kept write stays in the slot, the extraction stands ahead
const entries = _Object$entries;
const [{
  other
}] = [kw = (eff('b'), _globalThis), 7];
// the FLAT twins anchor on the hop's own surface, prefix replayed inside, write kept inside
const hasOwn = _Object$hasOwn;
const {
  hasOwn: _unused2,
  ...restB
} = (eff('c'), _globalThis.Object);
const keys = _Object$keys;
const {
  keys: _unused3,
  ...restC
} = (kw = (eff('d'), _globalThis), _globalThis.Object);
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };