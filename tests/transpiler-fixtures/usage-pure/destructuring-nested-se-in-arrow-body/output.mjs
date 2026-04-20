import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
wrap({
  fn: () => {
    innerCall();
    const of = _Array$of;
  }
});
const from = _Array$from;