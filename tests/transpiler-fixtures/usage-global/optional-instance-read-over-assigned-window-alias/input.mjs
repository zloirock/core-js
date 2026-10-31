// A later assignment captures the window probe before an optional instance read.
// The receiver memo retains both the source alias proof and the environment guard.
// The second window read has its own guard; a prior capture cannot prove it present.
let realm;
realm = globalThis.window;
export const value = realm?.window?.self.items.at(-1);
