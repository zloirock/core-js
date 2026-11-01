// A native rest-bearing leaf keeps its original nested pattern and loop receiver.
for (const realm of [globalThis]) {
  const { Array: { prototype: { at, ...rest } } } = realm;
  use(at, rest);
}
