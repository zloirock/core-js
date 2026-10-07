// Other sources keep their rest exclusions and independently claimed statics.
// Behind the default's effect prefix a logical whose left the build serves folds to it: `.Array`, and
// `.Number`, a global core-js extends in place.
function effect() {}
function f({ from, ...rest } = (effect(), globalThis.self.Array || Set)) {
  return from([1]);
}
f();
function g({ isInteger, ...rest } = (effect(), globalThis.self.Number || Set)) {
  return isInteger(1);
}
g();
