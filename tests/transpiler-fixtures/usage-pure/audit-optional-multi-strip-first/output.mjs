import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// chained optionals around a polyfilled method: `obj?.at?.(0)?.next?.(1)`. polyfill
// rewrites the inner `.at` and `normalizeOptionalChain` with `stripFirstOptional=true` is
// expected to deoptionalise only the FIRST user-written `?.` adjacent to the replaced node;
// downstream `?.next?.(1)` must still short-circuit on null at runtime. distinct outer
// continuation `.flat` would not test the same pattern - keep both lines on the same
// chained-optional shape with different methods on the polyfilled side
const a = (obj == null ? void 0 : _at(obj)?.call(obj, 0))?.next?.(1);
const b = (obj == null ? void 0 : _flatMaybeArray(obj)?.call(obj))?.next?.(2);