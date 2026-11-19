// NEGATIVE: a `?.` ON the probe hop stays, and so does the read it guards
export const optionalOnProbe = globalThis.window?.noSuchStatic;
