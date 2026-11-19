import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// A for-init destructuring a realm selection binds a constructor that a later computed key's effect reads:
// babel binds it ahead of the key, while unplugin runs the key effects ahead of the bindings, so there the
// effect meets the binding uninitialized (sidecar).
for (const M = _Map, {
    [(use(M), "Set")]: _unused
  } = _globalThis, S = _Set;;) break;