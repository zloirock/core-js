// TS `object` is wide - typeof-ish guards like `Array.isArray(x)` narrow it to an array
// type at runtime. inside the `if` branch `.at(0)` should dispatch the array-specific
// polyfill even though the declared annotation was only `object`
function f(x: object) {
  if (Array.isArray(x)) return x.at(0);
}
