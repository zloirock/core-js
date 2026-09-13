import _Array$from from "@core-js/pure/actual/array/from";
import _Reflect from "@core-js/pure/actual/reflect";
// A replaced invoker observes the original arguments. A known function parameter does not
// authorize synthesizing the values passed to the user replacement of Reflect.apply.
function read([{
  from
} = {
  from: _Array$from
}]) {
  return from;
}
_Reflect.apply = (fn, receiver, args) => args[0][0] === Array;
_Reflect.apply(read, null, [[Array]]);