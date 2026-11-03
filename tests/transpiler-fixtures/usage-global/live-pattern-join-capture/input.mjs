// A native array pattern precedes a static and effectful or unknown computed keys.
// Global injection preserves their order and keeps every source pattern.
const { b: [], Array: { from, [(effect(), "of")]: of, [key]: value } } = globalThis;
