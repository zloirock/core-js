import _at from "@core-js/pure/actual/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
{
  const v = _Promise$resolve(...([[1, 2]] as any));
  v.then(a => _at(a).call(a, 0));
}