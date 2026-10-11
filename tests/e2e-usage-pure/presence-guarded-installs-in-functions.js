// two presence-guarded installs of one global, each in a function of its own - the shape of bundled modules each
// shimming it - in their own module: the build decides that neither runs, so every read of the global takes the
// pure import, which an engine lacking a static of it needs. the shim throws, so an install that ran fails its row
function MapShim() { throw new Error('the shim was installed'); }
function installMap() { if (!globalThis.Map) globalThis.Map = MapShim; }
function installMapAgain() { if (!globalThis.Map) globalThis.Map = MapShim; }
installMap();
installMapAgain();

QUnit.test('presence-guarded installs in functions: the read after them takes the pure import', assert => {
  const grouped = Map.groupBy([1, 2, 3], value => value % 2);
  assert.deepEqual(grouped.get(1), [1, 3]);
  assert.same(new Map([[1, 2]]).get(1), 2);
});
