import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Array literals held by bindings keep their effects and nested native property reads.
// An outer inline wrapper retains its trailing effect before either iteration.
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