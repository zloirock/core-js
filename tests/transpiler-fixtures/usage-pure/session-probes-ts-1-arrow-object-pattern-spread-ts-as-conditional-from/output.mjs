import _Array$from from "@core-js/pure/actual/array/from";
// probe corpus of the defense cycles over the destructure wrappers, family "ts", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const r = (({
    from: f
  }) => f)(...([pick ? {
    from: _Array$from
  } : userObj] as any));
}