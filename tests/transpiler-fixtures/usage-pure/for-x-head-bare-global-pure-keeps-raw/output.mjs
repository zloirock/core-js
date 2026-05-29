import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// for-in / for-of head bound to a bare global identifier is a write target: in pure mode the
// global must NOT be rewritten to a frozen `@core-js/pure` import, since reassigning that const
// binding in the loop head would TypeError. unplugin leaves it bare; babel currently rewrites it
// to the frozen import (a separate, still-open babel-side gap), so the two outputs diverge here.
// distinct globals per line keep the per-line behavior clear
for (_Map of []) {}
for (_Set in {}) {}