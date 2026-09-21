import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// A defined array element keeps its object-pattern default dead.
// The static receives its pure method and preceding elements retain their values.
const [, {
  from
} = {}] = [_Set, {
  from: _Array$from
}];
from([1]);