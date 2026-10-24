import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const wrap = [(eff('h'), _globalThis), eff('i')];
const [{
  Reflect: {
    ownKeys
  }
}] = wrap;
const wrap2 = [[(eff('j'), _globalThis), eff('k')]];
const [[{
  Object: {
    entries
  }
}]] = wrap2;
const w3 = [_globalThis];
const [[{
  Object: {
    hasOwn
  }
}]] = [w3, eff('m')];
export { ownKeys, entries, hasOwn, seen };