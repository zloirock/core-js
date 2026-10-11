// presence-guarded installs of one global in functions of their own, behind a presence-guarded delete of it at the
// top level, in their own module: the build decides that none runs whichever leads, so every read of the global
// takes the pure import, which an engine lacking a static of it needs. the shim throws, so an install that ran
// fails its row
function MapShim() { throw new Error('the shim was installed'); }
if (typeof Map == 'undefined') delete globalThis.Map;
function installMap() { if (!globalThis.Map) globalThis.Map = MapShim; }
function installMapAgain() { if (!globalThis.Map) globalThis.Map = MapShim; }
installMap();
installMapAgain();

QUnit.test('presence-guarded installs past a delete: the read after them takes the pure import', assert => {
  const grouped = Map.groupBy([1, 2, 3], value => value % 2);
  assert.deepEqual(grouped.get(1), [1, 3]);
  assert.same(new Map([[1, 2]]).get(1), 2);
});
