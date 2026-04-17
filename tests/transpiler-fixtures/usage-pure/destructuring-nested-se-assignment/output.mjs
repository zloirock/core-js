import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
let from;
wrap({
  fn: () => {
    innerCall(), Array;
    const of = _Array$of;
  }
}), Array;
from = _Array$from;