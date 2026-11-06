// Native getter leaves surround a served constructor at their original source positions.
// Each getter observes only the bindings already initialized before its own read.
const log = [];
const { at: first, realm: { WeakSet: Value }, includes: last } = {
  get at() { log.push('first'); return function () { return 41; }; },
  get realm() { log.push(typeof first); return globalThis; },
  get includes() { log.push(typeof Value); return function () { return 42; }; },
};
export { first, Value, last, log };
