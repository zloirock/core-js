// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order.
const { w: { WeakSet: value } } = {
  get w() {
    mark();
    return globalThis;
  },
};
