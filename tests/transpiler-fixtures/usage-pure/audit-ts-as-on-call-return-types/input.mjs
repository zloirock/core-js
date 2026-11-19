// `Promise.all([1,2]) as any` - the TS `as` cast erases the static type, but the runtime
// still returns a Promise. `.then((a: number[]) => a.at(0))` - the callback's parameter
// annotation carries the Array hint to the downstream `.at(0)`, which picks the array-specific
// polyfill over the generic instance fallback
const r = (Promise.all([1, 2]) as any).then((a: number[]) => a.at(0));
