// Flatten on the first declarator with a sibling arrow holding both a `globalThis` receiver-ref
// and an instance-method call `.values()`. The arrow body is rewritten (adding `var _ref;` for
// receiver memoize) against the original source, while the `globalThis -> _globalThis` substitution
// targets text inside that same slice. If the substitution mutates what the body-wrap matches
// against, the wrap is dropped and a stray `)` from the original `.values()` leaks into the emit.
const { Array: { from } } = globalThis, val = () => [globalThis].values();
console.log(from, val());
