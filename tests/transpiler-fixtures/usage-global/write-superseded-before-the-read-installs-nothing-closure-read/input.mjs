// A write a later unconditional write overwrites before the read, or before a closure reading the name is even defined, installs
// nothing the read observes: in usage-global its constructor's static stays out.
let inClosure = null;
inClosure = Object;
inClosure = Map;
export const closureRead = () => inClosure.groupBy([1], x => x);
