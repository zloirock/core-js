// computed Symbol.iterator call inside spread: `[...obj[Symbol.iterator]()]`. usage-pure
// recognizes `obj[Symbol.iterator]()` as iterator invocation and rewrites to `_getIterator(obj)`
// (single helper that handles the iterator dispatch). spread context wraps the iterator
// rewrite without altering it - covers iterator-call-inside-spread invariant
const result = [...obj[Symbol.iterator]()];
