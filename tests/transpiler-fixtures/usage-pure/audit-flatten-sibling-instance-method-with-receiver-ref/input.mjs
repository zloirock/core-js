// flatten on decl[0] + sibling decl[1] arrow with BOTH a `globalThis` receiver-ref AND an
// instance-method call (`.values()`). instance-method emit body-wraps the arrow expr body
// into `{ var _ref; return _valuesMaybeArray(_ref = [...]).call(_ref); }`. body-wrap
// captures its needle from ORIGINAL source. `sibling-receiver ref polyfilling` queues the
// `globalThis -> _globalThis` substitution on transform-queue (not as a preservedSrc
// splice anymore) so compose nests substitution INTO the body-wrap content via needle
// match. previously the splice path mutated preservedSrc to `_globalThis` BEFORE body-wrap
// composed - body-wrap's needle (original `[globalThis].values()`) no longer matched the
// mutated preservedSrc, dropping the wrap composition and leaking a trailing `)` from the
// unreplaced `.values()` call expression
const { Array: { from } } = globalThis, val = () => [globalThis].values();
console.log(from, val());
