// Constructors read off a realm selection by effectful keys in a for-init and an unbraced `var`: unplugin
// runs each key's effect right ahead of the binding it keys, in source order (the sidecar); babel batches the
// for-init's effects ahead of its bindings and binds the `var`'s constructor ahead of its effect - its debt.
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";

for (const { [(e(), "Map")]: _unused } = _globalThis,
	M = _Map,
	{ [(e2(), "Set")]: _unused2 } = _globalThis,
	S = _Set; ; ) break;

if (k) var { [(e(), "WeakMap")]: _unused3 } = _globalThis,
	W = _WeakMap,
	{ zz } = _globalThis;