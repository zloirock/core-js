// optional spellings on the TRAILING dispatch keep their own guards over the collapsed static
const p = () => globalThis;
export const viaOptionalTrailing = p()?.window?.Promise.resolve(4)?.then?.(x => x);
