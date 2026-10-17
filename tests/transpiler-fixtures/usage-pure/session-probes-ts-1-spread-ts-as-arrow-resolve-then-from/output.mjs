import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
{
  const v = _Promise$resolve(...([Array] as any));
  v.then(A => A.from([]));
}