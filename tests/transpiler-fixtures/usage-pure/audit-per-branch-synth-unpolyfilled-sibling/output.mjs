import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// The local true selector decides Array.from. The unresolved `custom` read still follows the actual
// selected receiver. `constructor-selection-keeps-an-unresolved-sibling` keeps both constructor arms
// and their plain sibling live.
let cond = true;
const r = (({
  from,
  custom
} = cond ? {
  from: _Array$from,
  custom: Array.custom
} : _Iterator) => [from([1]), custom])();