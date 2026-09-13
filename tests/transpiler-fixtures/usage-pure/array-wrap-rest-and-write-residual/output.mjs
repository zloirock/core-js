import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const [{
  Object: {
    fromEntries,
    ...restA
  }
}] = [(eff('a'), _globalThis)];
// a verbatim SIBLING keeps it too; a kept write stays in the slot, the extraction stands ahead
const entries = _Object$entries;
const [{
  other
}] = [kw = (eff('b'), _globalThis), 7];
// the FLAT twins anchor on the hop's own surface, prefix replayed inside, write kept inside
const {
  Object: {
    hasOwn,
    ...restB
  }
} = (eff('c'), _globalThis);
const {
  Object: {
    keys,
    ...restC
  }
} = kw = (eff('d'), _globalThis);
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };