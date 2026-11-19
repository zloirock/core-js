import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A call root executes before a retained realm key. Nested key claims stay polyfilled and run once.
const log = [];
const callBeforeKey = (() => {
  _pushMaybeArray(log).call(log, "call");
  return _globalThis;
})()[_pushMaybeArray(log).call(log, "key"), "self"].Array.of(1);
const keyOnly = _globalThis[_pushMaybeArray(log).call(log, "k2"), "self"].Array.from([2]);
export { callBeforeKey, keyOnly, log };