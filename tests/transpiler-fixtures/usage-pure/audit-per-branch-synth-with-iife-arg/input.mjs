// IIFE arg is a conditional `cond ? Array : Iterator` and the IIFE param destructures
// `{ from }`. each branch must be rewritten to its own polyfill alias so the call
// dispatches correctly regardless of which branch wins at runtime
const result = (({ from }) => from([1]))(cond ? Array : Iterator);
export { result };
