// A constructor name behind an alias does not prove its prototype read safe.
const held = globalThis.window?.Array;
export const { [(effect(), "includes")]: includes } = held.prototype;
