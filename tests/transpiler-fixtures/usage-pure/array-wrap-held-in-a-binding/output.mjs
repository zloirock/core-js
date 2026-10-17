import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// An array literal held in a binding hands its element to a later destructure: the binding's own
// declaration keeps every effect of the literal, so the static extracts whatever trails the element,
// at any depth. An inline wrapper around such a binding keeps its own trailing effect in the native
// initializer, ahead of both iterations.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const wrap = [(eff('h'), _globalThis), eff('i')];
const [_ref] = wrap;
const ownKeys = _Reflect$ownKeys;
const wrap2 = [[(eff('j'), _globalThis), eff('k')]];
const [[{
  Object: {
    entries: _unused
  }
}]] = wrap2;
const entries = _Object$entries;
const w3 = [_globalThis];
const [[{
  Object: {
    hasOwn: _unused2
  }
}]] = [w3, eff('m')];
const hasOwn = _Object$hasOwn;
export { ownKeys, entries, hasOwn, seen };