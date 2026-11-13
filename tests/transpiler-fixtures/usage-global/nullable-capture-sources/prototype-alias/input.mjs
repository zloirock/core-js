// A constructor name behind an alias does not prove its prototype read safe.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.Array;
export const { [(effect(), "includes")]: includes } = held.prototype;
