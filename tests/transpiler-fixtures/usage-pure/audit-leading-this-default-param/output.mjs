import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A defaulted param's type narrows the binding only when no call site overrides it. that override check
// reads call args by index, which are this-dropped at runtime - so a leading `this` pseudo-param must
// shift the arg index down by one (the AST params keep the raw slot). `never` is only called with no
// args, so its default `[1, 2]` authoritatively narrows `x` to number[]. `over` is called with a string,
// which overrides `y` - the binding then resolves to the uncertain union and the helper stays generic.
// without the shift, the override is read one slot late, missed, and `y` is wrongly narrowed to the
// default's array type (`_includesMaybeArray` on a string -> ie:11 throw). distinct methods identify each.
function never(this: Window, x = [1, 2]) {
  return _atMaybeArray(x).call(x, 0);
}
function over(this: Window, y = [1, 2]) {
  return _includes(y).call(y, 1);
}
never();
over("s");