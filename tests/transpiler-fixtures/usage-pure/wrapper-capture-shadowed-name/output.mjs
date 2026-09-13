import _Array$from from "@core-js/pure/actual/array/from";
// The assigned literal captures a block-local object sharing the outer object's name.
// Its nested write affects the inner object alone; the outer typed static still injects.
const original = {
  x: Array
};
let alias = {
  x: Object
};
{
  const original = {
    x: Array
  };
  alias = {
    box: original
  };
  alias.box.x = {
    from: () => 'custom'
  };
}
_Array$from([1]);