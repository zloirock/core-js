// nested optional chain with two polyfilled instance methods: `obj?.at(0)?.includes(42)`.
// plugin must polyfill `.at` and `.includes` simultaneously and emit a single combined
// expression preserving the optional-chain short-circuit semantics
const r = obj?.at(0)?.includes(42);
