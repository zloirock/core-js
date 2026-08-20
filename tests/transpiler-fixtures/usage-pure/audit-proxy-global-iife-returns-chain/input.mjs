// IIFE body returns a proxy-global member CHAIN (`globalThis.self`), not just a bare
// identifier. `proxy-global chain-link predicate` recurses through the .self link and bottoms out on
// `globalThis` Identifier. validates that type-inference for `out.at(0)` resolves through
// `_Array$from`'s return type and picks the Array-narrowed `_atMaybeArray` variant
const out = (() => globalThis.self)().Array.from([1, 2, 3]);
out.at(0);
