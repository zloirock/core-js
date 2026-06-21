// untyped `x` + `typeof === 'object'` guard for `.entries()`. the typeof-positive narrow
// admits BOTH `array` and `domcollection` variants (NodeList / DOMTokenList carry native
// `.entries` in modern engines but not IE11), so resolution must prefer the generic dom-aware
// `instance/entries` rather than picking the first variant - `array/instance/entries` only
// handles Array-typed receivers and TypeErrors on NodeList at IE11.
function f(x) {
  if (typeof x === "object") x.entries();
}
