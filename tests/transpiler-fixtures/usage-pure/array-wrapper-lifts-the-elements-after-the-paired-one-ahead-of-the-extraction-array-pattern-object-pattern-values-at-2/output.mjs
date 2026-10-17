import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// an array wrapper pairs its first element with a two-hop pattern, and the elements after it - one, two, a
// hole between - run as statements ahead of the extraction, in the declaration's place among the statements
// and declarations around it; with no element after it the leaves dispatch off the element alone
function eff() {
  return Object;
}
{
  r;
  eff();
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}