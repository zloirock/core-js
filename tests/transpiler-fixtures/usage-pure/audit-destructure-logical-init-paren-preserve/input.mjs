// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { from, ...rest } = globalThis.Array ?? (globalThis.Set || Map);
const { groupBy, ...others } = globalThis.Map ?? (globalThis.WeakMap || Set);
export { from, rest, groupBy, others };
