import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let kw;
const [{
  Object: {
    fromEntries,
    ...restA
  }
}] = [(eff('a'), _globalThis)];
const [{
  Object: {
    entries
  },
  other
}] = [kw = (eff('b'), _globalThis), 7];
eff('c');
const hasOwn = _Object$hasOwn;
const {
  Object: {
    hasOwn: _unused,
    ...restB
  }
} = _globalThis;
const keys = _Object$keys;
const {
  Object: {
    keys: _unused2,
    ...restC
  }
} = kw = (eff('d'), _globalThis);
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };