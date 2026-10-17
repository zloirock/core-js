import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a call whose parens hold only trivia is still a ZERO-arg call, so no separator may precede its
// arguments: taking arity from the sliced text instead of the AST emitted `.call(recv, )`, and a
// trailing comma stops the whole module from parsing on the ES5 baseline this method targets.
// one row per renderer that joins arguments after a receiver, since each renders its own separator.
const a = [[1]];
export const parenLookup = (a == null ? void 0 : _atMaybeArray(a)).call(a);