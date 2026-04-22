// nested `Symbol[Symbol.iterator]` as `in`-LHS: `in` rewrite bails (Symbol is not
// iterable at runtime); inner computed Symbol.iterator access still polyfilled
const x = Symbol[Symbol.iterator] in obj;
globalThis.__x = x;
