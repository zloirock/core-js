// This method is not supplied by loop syntax, so the import set observes the receiver.
for (const realm of [globalThis]) {
  const read = realm => {
    const { Array: { prototype: { at: method } } } = realm;
    return method;
  };
  use(read(other));
}
