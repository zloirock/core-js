import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
// an array wrapper pairs its first element with a two-hop pattern, and the elements after it - one, two, a
// hole between - run as statements ahead of the extraction, in the declaration's place among the statements
// and declarations around it; with no element after it the leaves dispatch off the element alone
function eff() {
  return Object;
}
function eff2() {}
{
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  r;
  eff();
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  r;
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  r;
  eff();
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  r;
  eff();
  eff2();
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  r;
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  const keys = _keys(r.w);
  [values, at, keys];
}
{
  r;
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  r;
  eff('m');
  const keys = _keys(r.w);
  const flat = _flatMaybeArray(r.y);
  [values, at, keys, flat];
}
{
  r;
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  const q = 1;
  [values, at, q];
}
{
  r;
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
}