// a PROVEN call root collapses like any other receiver, so its argument is discarded too
export const provenCallArg = (() => globalThis)(Promise).self.Array.of(5);
