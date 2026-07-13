import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Set from "@core-js/pure/actual/set/constructor";
import _structuredClone from "@core-js/pure/actual/structured-clone";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// binding-less destructures of globals split on IDENTITY: a same-key pair from the proxy
// global (`({ Promise } = globalThis)`, flat `WeakSet = globalThis.WeakSet`, any proxy
// receiver) copies the slot's own value back - a no-op, NOT a mutation - so the pristine
// flatten + static narrowing apply, uniform with the lowercase and declaration forms of the
// same idiom. a FOREIGN value genuinely mutates the slot and DEOPTS the name - its reads stay
// verbatim on the live binding: a cross-key pair (`{ m: Map }`), a cross-global pair
// (`{ Iterator: WeakRef }` - only the written VALUE name deopts, the KEY name stays a
// polyfillable read), and a pattern DEFAULT (`{ AggregateError = shim }` - installs the
// foreign default on the absent slot)
Promise = _Promise;
use(_Promise$resolve(1));
WeakSet = _WeakSet;
use(new _WeakSet());
Symbol = _Symbol;
use(_Symbol$asyncIterator);
({
  m: Map
} = _globalThis);
use(new Map([[1, 2]]));
({
  AggregateError = shim
} = _globalThis);
use(new AggregateError([], 'm'));
structuredClone = _structuredClone;
use(_structuredClone(payload));
const S = _Set;
use(new S([3]));
WeakRef = _Iterator;
use(new WeakRef(target), _Iterator.range(0, 2));