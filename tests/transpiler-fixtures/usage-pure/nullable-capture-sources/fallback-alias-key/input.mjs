// A fallback must prove its aliased value before discarding null rejection.
const held = globalThis.window?.Array;
const missing = undefined;
export const { [(effect(), "from")]: from } = missing ?? held;
