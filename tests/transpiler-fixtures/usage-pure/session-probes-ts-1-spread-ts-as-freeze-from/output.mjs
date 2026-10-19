import _Object$freeze from "@core-js/pure/actual/object/freeze";
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const v = _Object$freeze(...([Array] as any));
  v.from([]);
}