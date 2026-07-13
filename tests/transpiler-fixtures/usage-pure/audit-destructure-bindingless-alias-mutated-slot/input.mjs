// binding-less destructures of globals split on IDENTITY: a same-key pair from the proxy
// global (`({ Promise } = globalThis)`, flat `WeakSet = globalThis.WeakSet`, any proxy
// receiver) copies the slot's own value back - a no-op, NOT a mutation - so the pristine
// flatten + static narrowing apply, uniform with the lowercase and declaration forms of the
// same idiom. a FOREIGN value genuinely mutates the slot and DEOPTS the name - its reads stay
// verbatim on the live binding: a cross-key pair (`{ m: Map }`), a cross-global pair
// (`{ Iterator: WeakRef }` - only the written VALUE name deopts, the KEY name stays a
// polyfillable read), and a pattern DEFAULT (`{ AggregateError = shim }` - installs the
// foreign default on the absent slot)
({ Promise } = globalThis);
use(Promise.resolve(1));
WeakSet = globalThis.WeakSet;
use(new WeakSet());
({ Symbol } = self);
use(Symbol.asyncIterator);
({ m: Map } = globalThis);
use(new Map([[1, 2]]));
({ AggregateError = shim } = globalThis);
use(new AggregateError([], 'm'));
({ structuredClone } = globalThis);
use(structuredClone(payload));
const { Set: S } = globalThis;
use(new S([3]));
({ Iterator: WeakRef } = globalThis);
use(new WeakRef(target), Iterator.range(0, 2));
