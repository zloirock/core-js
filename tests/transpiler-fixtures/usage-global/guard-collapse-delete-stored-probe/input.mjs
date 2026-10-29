// The retained window probe owns the optional; self adds no second surface.
let held;
delete (held = globalThis.window)?.self.routeSelectionBox.value;
