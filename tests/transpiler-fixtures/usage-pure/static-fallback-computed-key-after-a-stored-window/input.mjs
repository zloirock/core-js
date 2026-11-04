// The root prefix and store run before the test. The computed constructor key runs only in its live arm.
let held;
export const value = (prefix(), held = globalThis.window)?.[(key(), "Map")].unknown;
