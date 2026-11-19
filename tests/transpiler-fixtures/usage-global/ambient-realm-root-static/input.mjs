// An erased declaration does not shadow the external realm's static.
declare const globalThis: any;
export const value = globalThis.Array.of(31);
