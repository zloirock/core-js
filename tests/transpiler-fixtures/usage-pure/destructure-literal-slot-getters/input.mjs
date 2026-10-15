// All literal slots finish before the nested receiver is captured and dispatched.
// A neighbouring getter must run once without leaving the instance read native.
const events = [];
const source = {
  get y() { events.push('y'); return [1, 2]; },
  get z() { events.push('z'); return 1; },
};
const { y: { at } } = { y: source.y, z: source.z };
