import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An IIFE returning globalThis at the root of a receiver chain
// (`(() => globalThis)().Array.from([...])`). The call is inlined to reach the global, so
// Array.from is polyfilled and the result's `.at(0)` narrows to Array - and the inner
// globalThis is not separately rewritten over the same span.
const out = _Array$from([1, 2, 3]);
_atMaybeArray(out).call(out, 0);