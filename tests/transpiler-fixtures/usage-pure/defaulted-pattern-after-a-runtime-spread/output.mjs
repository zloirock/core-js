import _at from "@core-js/pure/actual/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// An unknown runtime spread can supply the pattern; it does not prove omission.
// Keep the Array default in its own arm and serve the actual instance generically.
Array.prototype[_Symbol$iterator] = function* () {
  yield 'text';
};
export const result = ((_ref = [1]) => {
  let at = _at(_ref);
  return at.call('ok', 0);
})(...[]);