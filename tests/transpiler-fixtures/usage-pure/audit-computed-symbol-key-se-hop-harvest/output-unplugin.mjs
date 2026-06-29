import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// a Symbol.iterator computed KEY whose Symbol chain receiver buries a side effect in a proxy-hop key
// (`o[(globalThis[(eff(), 'self')].Symbol).iterator]`): the whole `o[key]` collapses to the iterator
// helper, so the buried effect MUST be harvested ahead of it - else it is silently dropped (SE-loss). the
// PARENTHESIZED chain receiver is peeled to reach the member that carries the effect
let a = 0;
let b = 0;
const arr = [1, 2];
(a++, _getIteratorMethod(arr));
(b++, _getIteratorMethod(arr));
a;
b;