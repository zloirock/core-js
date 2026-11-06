import _at from "@core-js/pure/actual/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const v = _Promise$resolve(...([[1, 2]] as any));
  v.then(a => _at(a).call(a, 0));
}