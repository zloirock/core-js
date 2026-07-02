import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// let declared inside a bare block statement with a compound-assign overwrite.
// the resolver must read the block body the same way as Program / function
// body to honour the straight-line assignment. without it the binding stays at
// its declared shape and over-injects an unrelated polyfill variant.
{
  let x = "";
  x += "hi";
  _atMaybeString(x).call(x, 0);
}