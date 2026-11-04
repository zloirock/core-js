// A constant key identifies the constructor while the optional realm access guards the entire call.
const ctor = "Array";
export const value = globalThis.window?.self[ctor].of(1);
