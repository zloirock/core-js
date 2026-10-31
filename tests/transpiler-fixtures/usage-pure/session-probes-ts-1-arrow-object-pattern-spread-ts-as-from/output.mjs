import _Array$from from "@core-js/pure/actual/array/from";
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const r = (({
    from
  }) => from)(...([{
    from: _Array$from
  }] as any));
}