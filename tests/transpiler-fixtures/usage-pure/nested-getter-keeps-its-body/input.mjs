// The nested pattern keeps its getter and effects; only the returned realm is mirrored.
const { w: { WeakSet: value } } = {
  get w() {
    mark();
    return globalThis;
  },
};
