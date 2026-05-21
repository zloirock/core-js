import _getIterator from "@core-js/pure/actual/get-iterator";
// Symbol[(fn(), 'iterator')] computed-key SE prefix - polyfill rewrite was dropping the
// fn() side effect because resolveComputedSymbolKey resolved the key statically but never
// surfaced peeled SE prefixes through meta.sideEffects
let calls = 0;
const it = (calls++, _getIterator([1, 2, 3]));
it.next();