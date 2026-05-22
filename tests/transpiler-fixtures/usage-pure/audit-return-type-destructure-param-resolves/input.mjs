// Destructured object param `function f({ a, b }) { return a; }` invoked with a
// literal `{ a: [1, 2, 3], b: 'foo' }`: the destructured slot `a` carries the array
// literal type through the return, so `x.at(-1)` emits the array-instance polyfill.
function f({ a, b }) {
  return a;
}
const x = f({ a: [1, 2, 3], b: 'foo' });
x.at(-1);
