import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const v = _Promise$resolve(...([Array] as any));
  v.then(A => A.from([]));
}