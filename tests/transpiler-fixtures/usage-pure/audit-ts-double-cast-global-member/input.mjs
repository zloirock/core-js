// doubled TS `as` casts on a global member: both wrappers must be peeled to recognise
// the underlying receiver for polyfill rewrite.
(Map as any as unknown).groupBy([], x => x);
