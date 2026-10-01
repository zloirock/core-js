// the iterator helper is the emit canon of a `[Symbol.iterator]` read and is decided by the targets
// alone: excluding every module behind it by name must not flip the read to a raw static-symbol
// lookup, the way excluding the helper's entry path never did. ie 11 still needs the modules, so
// the helper is emitted
export const it = x[Symbol.iterator]();
