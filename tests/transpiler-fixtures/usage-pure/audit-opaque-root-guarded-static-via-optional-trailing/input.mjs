// optional spellings on the TRAILING dispatch keep their own guards over the collapsed static;
// a NON-polyfillable trailing member rides inside the guarded branch
const p = () => globalThis;
export const viaOptionalTrailing = p()?.window?.Promise.resolve(4)?.then?.(x => x);
