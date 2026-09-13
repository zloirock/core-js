// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
function effect() {}
function f({ from, ...rest } = (effect(), globalThis.self.Array || Set)) {
  return from([1]);
}
f();
