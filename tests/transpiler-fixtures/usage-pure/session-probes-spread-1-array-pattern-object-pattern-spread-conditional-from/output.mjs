import _Array$from from "@core-js/pure/actual/array/from";
// probe corpus of the defense cycles over the destructure wrappers, family "spread", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
{
  const [, {
    from: f
  }] = [...[0], pick ? {
    from: _Array$from
  } : userObj];
}