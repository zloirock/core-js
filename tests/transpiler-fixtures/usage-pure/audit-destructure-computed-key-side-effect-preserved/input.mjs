// computed destructure key whose prefix has a side effect (`[(eff(), "from")]`), resolving to a
// polyfillable static. the ONE robust emission (both plugins): keep the key IN PLACE with its value
// renamed to a throwaway (so the effect runs exactly once, in source order) and bind the polyfill
// separately - the polyfill ALWAYS wins on every engine, not just where the native is absent (a present-
// but-buggy native is replaced too). regression: the effect was once dropped, then defaulted to the native
const { [(effectful(), "from")]: f } = Array;
const doubled = [1, [2]].flat();
