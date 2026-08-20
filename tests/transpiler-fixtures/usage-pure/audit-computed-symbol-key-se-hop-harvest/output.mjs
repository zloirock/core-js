import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// a Symbol.iterator computed KEY whose Symbol chain receiver buries a side effect in a proxy-hop key
// (`o[(globalThis[(eff(), 'self')].Symbol).iterator]`): the whole `o[key]` collapses to the iterator
// helper, so the buried effect MUST be harvested ahead of it - else it is silently dropped (SE-loss). the
// PARENTHESIZED chain receiver is peeled to reach the member that carries the effect
let a = 0;
let b = 0;
const log = [];
const arr = [1, 2];
a++, _getIteratorMethod(arr);
b++, _getIteratorMethod(arr);
// an SE-bearing call at the Symbol chain ROOT evaluates BEFORE the buried hop-key effect - the
// rescued call must interleave ahead of the harvested key SE, not append after it
(() => (_pushMaybeArray(log).call(log, 'call'), _globalThis))(), _pushMaybeArray(log).call(log, 'key'), _getIteratorMethod(arr);
// same call-rooted receiver without hop-key effects - the root call alone still re-emits
(() => (_pushMaybeArray(log).call(log, 'only'), _globalThis))(), _getIteratorMethod(arr);
// full order across the chain: root call, receiver hop key, inner computed key
(() => (_pushMaybeArray(log).call(log, 'deep'), _globalThis))(), _pushMaybeArray(log).call(log, 'deep-key'), _pushMaybeArray(log).call(log, 'deep-ikey'), _getIteratorMethod(arr);
a;
b;
log;