// `include` (entry-path form on pure) FORCES substitution beyond targets in every emitting
// channel: statics, instance methods, iterator-method helper reads, well-known symbols and
// constructors all substitute although the targets support them natively
export const viaStatic = Array.from(items);
export const viaInstance = list.at(0);
export const viaHelper = arr[Symbol.iterator];
export const viaWellKnown = Symbol.asyncIterator;
export const viaConstructor = new Map(pairs);

// NEGATIVE control: a method NOT listed keeps the targets decision (natively supported -> raw)
export const notIncluded = Object.groupBy(items, keyFn);
