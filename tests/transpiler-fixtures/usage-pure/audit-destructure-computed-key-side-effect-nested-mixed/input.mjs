// Nested sibling branches combine a static Array key and an instance array key.
// Each branch reads its receiver, evaluates its key prefix, and initializes its
// binding in source order; both bindings receive the corresponding polyfill.
const arr = [1, [2]];
const { x: { [(before(), 'from')]: f }, y: { [(after(), 'flat')]: m } } = { x: Array, y: arr };
