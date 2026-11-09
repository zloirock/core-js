// The receiver guard covers the plain tail beyond a live optional call.
export function read(a) { return a?.at(0).foo?.().bar; }
