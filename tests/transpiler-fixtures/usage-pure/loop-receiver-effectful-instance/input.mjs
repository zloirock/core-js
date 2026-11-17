// This method is not supplied by loop syntax, so the import set observes the receiver.
for (const realm of [globalThis]) {
  const { Array: { prototype: { at: method } } } = (before(), realm);
  use(method);
}
