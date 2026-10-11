// presence-guarded installs of one global, each in a function of its own, the first through a destructure no
// hypothesis takes, in their own module: the build decides that none runs whichever leads, so every read of the
// global takes the pure import, which an engine lacking a static of it needs. the shim throws, so an install that
// ran fails its row
function MapShim() { throw new Error('the shim was installed'); }
// eslint-disable-next-line unicorn/no-unreadable-array-destructuring -- the destructured install is the tested write
function installMapByDestructuring() { if (!globalThis.Map) [globalThis.Map] = [MapShim]; }
function installMap() { if (!globalThis.Map) globalThis.Map = MapShim; }
installMapByDestructuring();
installMap();

QUnit.test('presence-guarded installs past a destructured install: the read after them takes the pure import', assert => {
  const grouped = Map.groupBy([1, 2, 3], value => value % 2);
  assert.deepEqual(grouped.get(1), [1, 3]);
  assert.same(new Map([[1, 2]]).get(1), 2);
});
