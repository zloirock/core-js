// a read ahead of every write of a global's slot in its own frame takes the pure import whatever the frame:
// a function invoked where it stands, a function that may run again, one invoked inside such a function,
// a loop. an engine lacking the global needs the import on the first run, and the runs after it take it
// as well - core-js wins over the patch the first run installed
export const once = (() => {
  const NativeMap = Map;
  globalThis.Map = ShimMap;
  return NativeMap;
})();
export function install() {
  const NativeWeakSet = WeakSet;
  globalThis.WeakSet = ShimWeakSet;
  return NativeWeakSet;
}
export function installNested() {
  return (() => {
    const NativeIterator = Iterator;
    globalThis.Iterator = ShimIterator;
    return NativeIterator;
  })();
}
for (const value of values) {
  use(new WeakMap(), value);
  globalThis.WeakMap = ShimWeakMap;
}
