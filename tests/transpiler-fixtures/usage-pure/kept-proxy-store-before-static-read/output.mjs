import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// The retained store runs before the static read and keeps its prefix once.
let held;
held = (effect(), _globalThis);
export const read = _Object$fromEntries;
export { held };