// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
function effect() {}
function f({ from, ...rest } = (effect(), globalThis.self.Array || Set)) {
  return from([1]);
}
f();
