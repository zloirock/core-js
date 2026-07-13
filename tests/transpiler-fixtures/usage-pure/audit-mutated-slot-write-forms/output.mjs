// every bare-identifier WRITE form of an unbound global name replaces the global slot like
// `globalThis.X = ...` - each records the slot mutation and DEOPTS the name: reads, writes
// and probes stay verbatim on the live binding (pure substitutes only what it is CERTAIN
// about; the runtime then serves exactly what the user's writes left). one distinct global
// per form: update (prefix and postfix), array-pattern element (flat and nested), object
// shorthand / renamed value, rest element, pattern default, for-of / for-in / for-await
// heads, pattern inside a for-of head, chained-assignment middle. a capitalized NON-built-in
// write deopts the same way; a read BEFORE the write deopts too - the record is file-wide,
// not flow-ordered (at runtime the early read sees the still-pristine slot, exactly like the
// untranspiled source)
Promise++;
use(Promise.resolve(1));
[Map] = pair;
use(Map.groupBy(items, tag));
({
  Set
} = box);
use(new Set([1]));
({
  weak: WeakMap
} = box);
use(new WeakMap());
[...WeakSet] = pool;
use(new WeakSet());
[Symbol = shim] = pair;
use(Symbol.asyncIterator);
for (Iterator of streams) use(Iterator.range(0, 5));
for (Array in box) use(Array.fromAsync(items));
for ([Number] of streams) use(Number.isFinite(value));
async function drain(stream) {
  for await (String of stream) use(String.raw(parts));
}
--AggregateError;
use(new AggregateError([], 'm'));
[[DisposableStack]] = deep;
use(new DisposableStack());
chain = SuppressedError = shim;
use(new SuppressedError(err, sup));
Foo = 5;
use(Foo);
use(Error.isError(candidate));
Error = shim;