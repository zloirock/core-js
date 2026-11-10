import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A var in a nested block still supplies the IIFE's receiver.
export function read() {
  {
    var Arr = Array;
  }
  return (({
    from
  } = Object) => from)(Arr);
}