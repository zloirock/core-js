import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A consumed assignment yields its selected receiver and dispatches the named static.
// A caller-supplied object's own slot keeps its value.
export function read(shim) {
  let from;
  const host = {
    from
  } = shim || Array;
  return [host, from];
}