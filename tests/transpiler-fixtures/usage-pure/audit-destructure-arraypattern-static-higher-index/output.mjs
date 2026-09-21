import _Array$from from "@core-js/pure/actual/array/from";
// A static at a later array index pairs with that exact source element.
// Earlier element bindings retain their original values.
const [a, b, {
  from
}] = [1, 2, {
  from: _Array$from
}];
from([a, b]);