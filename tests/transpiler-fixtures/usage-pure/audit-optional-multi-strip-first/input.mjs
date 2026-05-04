// chained optionals around a polyfilled method: `obj?.at?.(0)?.next?.(1)`. polyfill
// rewrites the inner `.at` and `normalizeOptionalChain` with `stripFirstOptional=true` is
// expected to deoptionalise only the FIRST user-written `?.` adjacent to the replaced node;
// downstream `?.next?.(1)` must still short-circuit on null at runtime. distinct outer
// continuation `.flat` would not test the same pattern - keep both lines on the same
// chained-optional shape with different methods on the polyfilled side
const a = obj?.at?.(0)?.next?.(1);
const b = obj?.flat?.()?.next?.(2);
