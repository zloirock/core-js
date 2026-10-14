// probed `delete` edges kept as written: a DOUBLE undefinable hop stands down (no single test spells
// the union of both absences) and an OPAQUE call root keeps its own `?.`. a `delete` in a nested value
// context takes the same guard as the statement form.
export const delDoubleHop = delete globalThis.window?.frames?.customZ;
function opaqueRoot() { return globalThis; }
export const delOpaque = delete opaqueRoot()?.window?.customW;
export const delNested = [delete globalThis.window?.self.customV];
