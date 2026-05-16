// untyped `x` + `typeof === 'object'` guard for `.entries()`. the typeof-positive narrow
// admits BOTH `array` and `domcollection` type variants (NodeList / DOMTokenList carry
// native `.entries` in modern engines but not IE11). resolveHint must prefer desc.common
// (the generic dom-aware dispatcher `instance/entries`) instead of merging deps and
// picking the FIRST entry by caller - that would yield `array/instance/entries` which
// only handles Array-typed receivers and TypeErrors on NodeList at IE11.
function f(x) {
  if (typeof x === "object") x.entries();
}
