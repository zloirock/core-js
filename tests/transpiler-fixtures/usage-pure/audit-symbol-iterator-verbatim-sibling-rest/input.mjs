// a `[Symbol.iterator]` prop whose plan-consumed extraction is the declarator's ONLY one
// still hands the emission to the flatten: the plan's existence makes the rebuild fireable
// from ANY sibling's dispatch (here non-consuming nested siblings - a missing-able ctor
// pattern and an unknown key), so a per-prop route would race it and crash the composition
const { [Symbol.iterator]: it, Map: { custom }, ...r } = globalThis;
it;
custom;
r;
const { [Symbol.iterator]: it2, Foo: { bar }, ...r2 } = globalThis;
it2;
bar;
r2;
