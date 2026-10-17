// The iterator key the regenerator helpers, `regenerator-runtime` and immutable spell - a `||` / `??` whose left is the well-known
// symbol through a decided `&&`, an alias of one, a static read off a decided realm selection or the symbol itself - always takes
// the left: the build serves that symbol, and a symbol is truthy.
function _regenerator() {
  var r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator";
  return function (e) {
    return e[n];
  };
}
export const regeneratorRead = _regenerator();
