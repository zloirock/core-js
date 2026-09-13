// A getter exposing its object through this keeps its returned realm for later readers.
let leaked;
const { w: { WeakSet: value } } = {
  get w() { leaked = this; return globalThis; },
};
inspect(leaked.w === globalThis);
