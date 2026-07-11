import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// an SE-computed key on an ARRAY-WRAPPED param default routes to the nested-mirror synth like
// its pure-key sibling: the default is replaced wholesale (caller-correct - a passed arg still
// destructures natively), the key text and its effect stay in the pattern and run once. the
// SE-key dispatch must thread the resolution meta through - dropping it demotes to the
// native-wins inline default and diverges from the text emitter
function f([{
  [(e(), 'from')]: from
}] = [{
  from: _Array$from
}]) {
  return from;
}
// plus-fold key routes the same
function g([{
  [(e(), 'o') + 'f']: of
}] = [{
  of: _Array$of
}]) {
  return of;
}
export const r = [f(), g()];