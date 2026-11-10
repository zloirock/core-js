// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  return (({
    entries,
    other
  }) => [typeof entries, typeof other])((note(), globalThis as any).window?.self.Object);
}
