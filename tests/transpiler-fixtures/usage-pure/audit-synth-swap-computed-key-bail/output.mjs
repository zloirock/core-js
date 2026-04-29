import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Array$from from "@core-js/pure/actual/array/from";
// synthetic argument-receiver substitution can't shape-rebuild when the key is computed
// and non-literal. body-extract fallback inserts `let from = _polyfill;` at function body
// top (let, not const - parameter binding was reassignable; downstream `from = newValue`
// in body must keep working) + removes the polyfilled prop from the destructure pattern;
// computed-key sibling stays as written. preserves "polyfill always wins" at the cost of
// caller-passed `{from: customFrom}` being ignored
function run({
  [_Symbol$iterator]: iter
} = Array) {
  let from = _Array$from;
  return from([1, 2, 3]);
}
run();