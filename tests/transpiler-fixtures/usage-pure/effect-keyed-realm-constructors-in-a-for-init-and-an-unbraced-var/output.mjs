import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// Constructors read off a realm selection by effectful keys in a for-init and an unbraced `var`: unplugin
// runs each key's effect right ahead of the binding it keys, in source order (the sidecar); babel batches the
// for-init's effects ahead of its bindings and binds the `var`'s constructor ahead of its effect - its debt.
for (const {
    [(e(), "Map")]: _unused,
    [(e2(), "Set")]: _unused2
  } = _globalThis, M = _Map, S = _Set;;) break;
if (k) var W = _WeakMap,
  {
    [(e(), "WeakMap")]: _unused3,
    zz
  } = _globalThis;