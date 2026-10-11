// an install in the sequence prefix of an instance call's receiver is decided on the tree as the source wrote it,
// before a render memoizes the receiver: it never runs, and the read after it takes the pure import in either leg
(typeof Promise == 'undefined' && (globalThis.Promise = PromiseShim), [1]).at(0);
export const ready = Promise.resolve(1);
