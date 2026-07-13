// bare slot writes reached through TS expression wrappers: the wrapper fills the pattern slot,
// so both the write-target reject (the leaf stays verbatim - a substituted frozen import would
// TypeError at the assignment) and the slot recording must peel it. each recorded name DEOPTS -
// later reads stay verbatim on the live binding. one global per form; a BOUND leaf stays an
// ordinary variable; the same wrapper in an object LITERAL stays a read and substitutes
[Promise!] = arr;
use(Promise.resolve(1));
[(Map as unknown)] = arr;
use(Map.groupBy(items, tag));
({ p: Set! } = box);
use(new Set([1]));
[...(WeakMap as any)] = arr;
use(new WeakMap());
[Symbol! = shim] = arr;
use(Symbol.asyncIterator);
function boundLeaf(Iterator) {
  [Iterator!] = arr;
  use(Iterator.range(0, 2));
}
use({ q: WeakSet! }, new WeakSet());
