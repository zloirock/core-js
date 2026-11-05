// the type-only TS require-import erases like every type-only form - the gate injects NOTHING
// for a member read off it. Both emitters preserve the type modifier and add no polyfill import.
import type gt3 = require("@core-js/pure/actual/global-this");
// @ts-expect-error a type-only import read as a value is the shape under test
export const viaErasedTsEquals = () => (gt3 as never as { Map: MapConstructor }).Map.groupBy([], (x: number) => x);
