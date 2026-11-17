// A loop binding supplies the receiver at this read.
for (const realm of [globalThis, globalThis]) {
  const read = () => {
    const { Array: { prototype: { includes } } } = realm;
    return includes;
  };
  use(read());
}
