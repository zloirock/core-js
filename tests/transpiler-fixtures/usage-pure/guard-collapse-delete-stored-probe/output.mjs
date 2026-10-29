import _globalThis from "@core-js/pure/actual/global-this";
// The retained window probe owns the optional; self adds no second surface.
let held;
delete (held = _globalThis.window)?.routeSelectionBox.value;