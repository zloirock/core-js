import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// IIFE body returns a proxy-global member CHAIN (`globalThis.self`), not just a bare
// identifier. `proxy-global chain-link predicate` recurses through the .self link and bottoms out on
// `globalThis` Identifier. validates that type-inference for `out.at(0)` resolves through
// `_Array$from`'s return type and picks the Array-narrowed `_atMaybeArray` variant
const out = _Array$from([1, 2, 3]);
_atMaybeArray(out).call(out, 0);