// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  return (({
    entries,
    // @ts-expect-error The dynamic realm object can have an unknown property.
    other
  }) => [typeof entries, typeof other])((globalThis satisfies any).window?.self.Object);
}
