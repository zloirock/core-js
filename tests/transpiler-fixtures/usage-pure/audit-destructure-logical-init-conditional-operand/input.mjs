// a retained logical init whose operand is a conditional (or an effect-free sequence) must polyfill
// the globals inside it - the blanket skip suppressed the natural visitor, so a raw operand leaks a
// native global (a ReferenceError on the taken fallback in older engines). a `...rest` sibling keeps
// the logical retained per-operand rather than fully consuming and dropping the fallback
const { from, ...rest } = globalThis.Array || (cond ? Set : Map);
const { of, ...others } = globalThis.Array || (readOnlyFlag, WeakSet);
export { from, rest, of, others };
