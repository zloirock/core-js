// `undefined` placeholder init - annotation `T | undefined` still narrows to T at the
// point of use, polyfill dispatch picks the array-specific helper
const arr: number[] | undefined = undefined;
const a = arr?.at(-1);
const b = arr?.flat();