// A getter supplying a realm cannot lose its body when its constructor leaf is served.
// Its mark call runs once before the WeakSet binding initializes.
const { w: { WeakSet: value } } = {
  get w() {
    mark();
    return globalThis;
  },
};
