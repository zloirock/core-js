// A live optional call keeps its following member inside the guarded chain.
export function read(a) { return globalThis.window?.Array.from(a).foo?.().bar; }
