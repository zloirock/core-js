// doubled TS `as` casts on a global member: both wrappers must be peeled to recognise
// the underlying receiver for polyfill rewrite.
// @ts-expect-error the member read is the probe, and the right answer is a type without it
(Map as any as unknown).groupBy([], x => x);
