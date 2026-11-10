import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A local undefined value supplies the argument instead of selecting the default.
export function read() {
  {
    var undefined = Array;
  }
  return (({
    from
  } = Object) => from([4]))(undefined);
}