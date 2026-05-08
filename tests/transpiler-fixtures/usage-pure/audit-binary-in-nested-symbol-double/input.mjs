// nested `Symbol[Symbol.iterator] in obj`: the doubly-nested key shape would resolve
// to a malformed `Symbol.Symbol.iterator`, so the `in` check must NOT polyfill-dispatch.
// the simple `Symbol.iterator in arr` next to it confirms the regular path still works
const a = Symbol[Symbol.iterator] in obj;
const b = Symbol.iterator in arr;
[a, b].includes(true);
