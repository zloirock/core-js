import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
// a computed key a const binding holds names that key: a flat pattern extracts as under the literal key - a
// realm constructor, an instance method off a literal, a static - and the constructor handed to a call takes its
// whole entry, its key read the same way
{
  const k = 'Map';
  const m = _Map;
  use(m);
}
{
  const k = 'at';
  const m = _atMaybeArray([1, 2]);
  use(m);
}
{
  const k = 'of';
  const f = _Array$of;
  use(f);
}