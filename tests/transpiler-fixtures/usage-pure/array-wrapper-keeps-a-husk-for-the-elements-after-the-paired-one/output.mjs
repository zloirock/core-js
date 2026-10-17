import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// a pattern the lift leaves - one hop, an unclaimed key beside the claimed ones, the wrapper's trailing
// spread - keeps a husk that evaluates the wrapper's elements ahead of the extraction, the unclaimed level
// read once; with no element after the paired one there is no husk
const rest = [];
function eff() {
  return Object;
}
{
  const [,] = [r, eff('n')];
  const at = _at(r.y);
  at;
}
{
  const at = _at(r.y);
  at;
}
{
  const [,] = [r, eff('n')];
  const {
    w: _ref
  } = r;
  const values = _values(_ref);
  const {
    is
  } = _ref;
  const at = _at(r.y);
  [values, is, at];
}
{
  const [,] = [r, ...rest];
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}