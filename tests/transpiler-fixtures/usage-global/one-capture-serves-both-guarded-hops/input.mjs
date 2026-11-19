// Each getter may return a different receiver. Both guards read their own slot once.
export function read(second) {
  const { set: { WeakSet: weak }, map: { Promise: promise } } = {
    get set() { return globalThis; },
    get map() { return second; },
  };
  return [weak, promise];
}
