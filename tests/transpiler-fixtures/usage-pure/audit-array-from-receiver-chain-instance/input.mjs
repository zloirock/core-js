// Polyfilled call site is itself the receiver of an instance method. The instance
// methods chained off `Array.from(input)` should each polyfill independently, and the
// `Array.from(input)` call must NOT be pushed into a side-effect sequence wrapper
// (which would double-invoke the polyfilled emit).
Array.from(input).at(-1);
Array.from(other).findLast(x => x);
Array.from(third).flat();
