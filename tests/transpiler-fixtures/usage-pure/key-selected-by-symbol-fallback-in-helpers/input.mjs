// the iterator key the regenerator helpers, `regenerator-runtime` and immutable spell - a `||` / `??`
// whose left is the well-known symbol through a decided `&&`, an alias of one, a static read off a
// decided realm selection or the symbol itself - always takes the left: the build serves that symbol,
// and a symbol is truthy. so each read is the iterator method, as `Symbol.iterator` spelled in the
// member is, and a static read off the realm selection names the symbol in a member key and in `in`.
// a realm the test may leave `{}`, and a string that only spells the name, keep the read native
function _regenerator() {
  var r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator";
  return function (e) {
    return e[n];
  };
}
export const regeneratorRead = _regenerator();
export function _regeneratorValues(e) {
  return e["function" == typeof Symbol && Symbol.iterator || "@@iterator"];
}
var $Symbol = typeof Symbol === "function" ? Symbol : {};
var iteratorSymbol = $Symbol.iterator || "@@iterator";
export const runtimeRead = iterable => iterable[iteratorSymbol];
var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
export const immutableRead = iterable => iterable[ITERATOR_SYMBOL];
const nullishKey = Symbol.iterator ?? '@@iterator';
export const nullishRead = receiver => receiver[nullishKey];
const orKey = Symbol.iterator || '@@iterator';
export const orRead = receiver => receiver[orKey];
const realm = typeof Symbol == 'function' ? Symbol : {};
export const memberRead = receiver => receiver[realm.iterator];
export const memberIn = receiver => realm.iterator in receiver;
const maybeRealm = flag ? Symbol : {};
const undecidedKey = maybeRealm.iterator || '@@iterator';
export const undecidedRead = receiver => receiver[undecidedKey];
const spelledKey = 'Symbol.iterator' || '@@iterator';
export const spelledRead = receiver => receiver[spelledKey];
