// `void 0` placeholder init treated identically to `undefined` / `null` - annotation
// drives polyfill dispatch when init is a synthetic nullish stub
const arr: string[] | undefined = void 0;
const a = arr?.includes("x");
const b = arr?.at(0);