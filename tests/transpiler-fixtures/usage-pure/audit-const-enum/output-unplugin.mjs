import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `const enum` - TS inlines member access at compile time, but the declaration AST is
// the same as regular enum (carries the same member initialisers). `.at(0)` on an
// `E`-typed value narrows to String instance polyfill since members are string-typed
const enum E { A = 'hello', B = 'world' }
declare const e: E;
_atMaybeString(e).call(e, 0);