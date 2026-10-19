import _Array$of from "@core-js/pure/actual/array/of";
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const r = ((a: any) => a)(...([Array] as any));
  const [{
    of: o
  }] = [...[{
    of: _Array$of
  }]];
}