// An effectful computed static key shares its pattern with a plain static key.
// The key effect runs once before either binding is initialized, and both bindings
// receive their distinct polyfills without duplicate declarations.
let log = [];
const { [(log.push(1), "from")]: x, of: y } = Array;
x([1]);
y(2);
export { log };
