// usage-global equivalents of the bare slot-write forms: the WRITE itself is a usage - the
// polyfill must load so the slot exists (a strict-mode write to a missing global
// ReferenceErrors; RMW forms read it first). every form injects the written name's modules
// and the statement stays verbatim. one distinct global per form: flat, array-pattern
// element (plain and nested), object shorthand / renamed value, rest element, pattern
// default, for-of assignment-pattern head. flat compound / logical / update / for-x heads
// are locked by the neighboring fixtures. BINDING patterns (declaration, param, catch,
// for-x declaration) bind locals instead of writing globals - nothing injects for them
// beyond the destructuring protocol
Promise = shim;
[Map] = pair;
({ Set } = box);
({ w: WeakMap } = box);
[...WeakSet] = pool;
[Iterator = fallback] = pair;
[[AggregateError]] = deep;
for ([Symbol] of streams);
const [DisposableStack] = locals;
use(DisposableStack);
function boundParam([SuppressedError]) { return SuppressedError; }
try { g(); } catch ({ AsyncDisposableStack }) { use(AsyncDisposableStack); }
for (const [AsyncIterator] of streams) use(AsyncIterator);
