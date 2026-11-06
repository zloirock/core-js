// Literal getter slots retain their evaluation order before an assignment's instance read.
// Either sibling order captures the actual receiver and serves its own distinct method.
const events = [];
const source = {
  get y() { events.push('y'); return [1, 2]; },
  get z() { events.push('z'); return 1; },
};
let at, includes;
({ y: { at } } = { z: source.z, y: source.y });
({ y: { includes } } = { y: source.y, z: source.z });
