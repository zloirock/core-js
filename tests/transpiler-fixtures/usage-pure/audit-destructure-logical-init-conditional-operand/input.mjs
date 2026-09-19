// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { from, ...rest } = globalThis.Array || (cond ? Set : Map);
const { of, ...others } = globalThis.Array || (readOnlyFlag, WeakSet);
export { from, rest, of, others };
