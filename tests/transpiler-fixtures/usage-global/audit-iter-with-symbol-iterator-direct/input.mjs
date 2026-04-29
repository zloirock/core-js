// explicit iterator-protocol invocation: the user calls `obj[Symbol.iterator]()` directly.
// the Symbol usage requires the es.symbol.iterator scaffold; the for-of over the returned
// iterator pulls in the iterator core modules as well
const arr = [1, 2, 3];
const it = arr[Symbol.iterator]();
for (const x of it) {
  console.log(x);
}
