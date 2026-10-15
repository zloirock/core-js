// A loop initializer retains every literal slot before its instance extraction.
// Both getter reads keep their order and execute once.
const events = [];
const source = {
  get y() { events.push('y'); return [1, 2]; },
  get z() { events.push('z'); return 1; },
};
for (var { y: { includes } } = { y: source.y, z: source.z }; !includes;) break;
