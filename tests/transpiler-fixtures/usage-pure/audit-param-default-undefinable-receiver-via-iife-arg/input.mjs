// A supplied IIFE argument preserves the optional host guard before destructuring.
export const viaIifeArg = (({ of }) => of)(globalThis.window?.Array);
