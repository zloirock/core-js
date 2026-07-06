// a Symbol.iterator computed KEY whose Symbol chain receiver buries a side effect in a proxy-hop key
// (`o[(globalThis[(eff(), 'self')].Symbol).iterator]`): the whole `o[key]` collapses to the iterator
// helper, so the buried effect MUST be harvested ahead of it - else it is silently dropped (SE-loss). the
// PARENTHESIZED chain receiver is peeled to reach the member that carries the effect
let a = 0;
let b = 0;
const log = [];
const arr = [1, 2];
arr[(globalThis[(a++, 'self')].Symbol).iterator];
arr[(globalThis.self[(b++, 'window')].Symbol).iterator];
// an SE-bearing call at the Symbol chain ROOT evaluates BEFORE the buried hop-key effect - the
// rescued call must interleave ahead of the harvested key SE, not append after it
arr[(() => (log.push('call'), globalThis))()[(log.push('key'), 'Symbol')].iterator];
// same call-rooted receiver without hop-key effects - the root call alone still re-emits
arr[(() => (log.push('only'), globalThis))().Symbol.iterator];
// full order across the chain: root call, receiver hop key, inner computed key
arr[(() => (log.push('deep'), globalThis))()[(log.push('deep-key'), 'Symbol')][(log.push('deep-ikey'), 'iterator')]];
a;
b;
log;
