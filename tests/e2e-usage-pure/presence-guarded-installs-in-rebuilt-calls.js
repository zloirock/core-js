// presence-guarded installs inside the argument or the receiver of an instance call pure rebuilds, in their own
// module: each is decided on the tree as the source wrote it, so neither runs and every read of the global takes
// the pure import, which an engine lacking a static of it needs. the shim throws, so an install that ran fails
function MapShim() { throw new Error('the shim was installed'); }
const pushed = [];
pushed.push(typeof Map == 'undefined' && (globalThis.Map = MapShim));
const first = (typeof Map == 'undefined' && (globalThis.Map = MapShim), [1]).at(0);

QUnit.test('presence-guarded installs in rebuilt calls: the read after them takes the pure import', assert => {
  assert.deepEqual(pushed, [false]);
  assert.same(first, 1);
  const grouped = Map.groupBy([1, 2, 3], value => value % 2);
  assert.deepEqual(grouped.get(0), [2]);
});
