// The receiver is the lexical loop binding, including a read moved into a closure.
for (const realm of [globalThis]) {
  const { Array: { prototype: { at } } } = realm;
  use(at);
}
for (const realm of [globalThis, globalThis]) {
  const read = () => {
    const { Array: { prototype: { includes } } } = realm;
    return includes;
  };
  use(read());
}
for (const realm of [globalThis]) {
  const { Array: { prototype: { [Symbol.iterator]: iterator } } } = (before(), realm);
  use(iterator);
}
for (const realm of [globalThis]) {
  const { WeakSet: { [Symbol.iterator]: method } } = (before(), realm);
  use(method);
}
