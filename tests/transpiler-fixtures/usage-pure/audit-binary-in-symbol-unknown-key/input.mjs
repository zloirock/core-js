// `Symbol[Symbol.foo]` references an unknown well-known name; the `in` check must NOT
// polyfill-dispatch since `foo` isn't a recognized Symbol. both `Symbol` references still
// polyfill on their own, as the whole family: a key no fold names may read any of its statics.
// paired with a known-good `Symbol.iterator in obj`
const a = Symbol[Symbol.foo] in obj;
const b = Symbol.iterator in obj;
[a, b].at(0);
