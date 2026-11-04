// The effect in a computed constructor key and the argument both stay inside the live branch.
export const value = globalThis.window?.self[(key(), "Array")].of(argument());
