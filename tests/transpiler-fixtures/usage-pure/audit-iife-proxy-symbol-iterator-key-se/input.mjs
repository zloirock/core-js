// IIFE-rooted proxy chain inside a computed Symbol.iterator KEY. the key folds to the get-iterator
// method but the IIFE chain root carries observable setup the fold must re-emit
let calls = 0;
const arr = [1];
const method = arr[(() => {
  calls++;
  return globalThis;
})().Symbol.iterator];
