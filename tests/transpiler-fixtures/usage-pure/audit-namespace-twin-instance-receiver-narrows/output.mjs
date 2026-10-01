import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var arr = [1, 2, 3];
namespace N {
  var arr = 'hello';
}
_atMaybeArray(arr).call(arr, 0);