// the type-only TS require-import erases like every type-only form - the gate injects NOTHING
// for a member read off it (the value twin lives in the alias-resolution fixture). the babel
// output drops the `type` modifier on reprint (an upstream generator gap); the unplugin sidecar
// keeps the source spelling - the axis under lock is the EMPTY import set, identical in both
import type gt3 = require("@core-js/pure/actual/global-this");
export const viaErasedTsEquals = () => (gt3 as never as { Map: MapConstructor }).Map.groupBy([], (x: number) => x);
