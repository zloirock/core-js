import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a read ahead of every write of a global's slot in its own frame takes the pure import whatever the frame:
// a function invoked where it stands, a function that may run again, one invoked inside such a function,
// a loop. an engine lacking the global needs the import on the first run, and the runs after it take it
// as well - core-js wins over the patch the first run installed
export const once = (() => {
  const NativeMap = _Map;
  _globalThis.Map = ShimMap;
  return NativeMap;
})();
export function install() {
  const NativeWeakSet = _WeakSet;
  _globalThis.WeakSet = ShimWeakSet;
  return NativeWeakSet;
}
export function installNested() {
  return (() => {
    const NativeIterator = _Iterator;
    _globalThis.Iterator = ShimIterator;
    return NativeIterator;
  })();
}
for (const value of values) {
  use(new _WeakMap(), value);
  _globalThis.WeakMap = ShimWeakMap;
}