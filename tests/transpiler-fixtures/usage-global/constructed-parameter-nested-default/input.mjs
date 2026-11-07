// A captured parameter keeps the type of its constructor default.
// The outer read uses the Map prototype, while the leaf keeps its array fallback.
function f({ keys: { at } = [] } = new Map()) { return at; }
f();
