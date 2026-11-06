// Source siblings surround a fully consumed initializer; its child claims stay live.
if (ready) var before = hit('before'),
  { from, of } = (hit(typeof from, Array.from([1])[0]), Array),
  after = hit('after');
if (ready) var left = hit('left'),
  { Array: { prototype: { at } } } = (hit(Array.from([3])[0]), globalThis),
  right = hit('right');
