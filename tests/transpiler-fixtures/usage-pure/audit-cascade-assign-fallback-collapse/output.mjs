import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Assignment receivers preserve call effects while serving the pure static.
// A collapsible realm selection needs no runtime choice of the method.
let from;
let of;
let c = true;
({
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
});
({
  Array: {
    of
  }
} = (() => c ? {
  Array: {
    of: _Array$of
  }
} : {
  Array: {
    of: _Array$of
  }
})());
from([1]);
of(2);