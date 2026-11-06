// Mixed values, a changed loop binding and a shadowed name keep their own receivers.
for (const realm of [globalThis, other]) {
  const { Array: { prototype: { at } } } = realm;
  use(at);
}
for (let realm of [globalThis]) {
  realm = other;
  const { Array: { prototype: { includes } } } = realm;
  use(includes);
}
for (const realm of [globalThis]) {
  const read = realm => {
    const { Array: { prototype: { [Symbol.iterator]: iterator } } } = realm;
    return iterator;
  };
  use(read(other));
}
