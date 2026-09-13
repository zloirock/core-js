// Ordinary instance reads on both sides join the nested guarded slot's schedule.
// The first method binds before the receiver getter, and the last sees the constructor.
// A constructor escaping through the getter includes its static methods.
const log = [];
const { at: first, realm: { WeakSet: Value }, includes: last } = {
  get at() { log.push('first'); return function () { return 41; }; },
  get realm() { log.push(typeof first); return globalThis; },
  get includes() { log.push(typeof Value); return function () { return 42; }; },
};
export { first, Value, last, log };
