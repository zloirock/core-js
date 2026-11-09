import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// A nested slot default keeps the static receiver, including the method used by its instance read.
function read({
  from: {
    name
  } = {}
} = Array) {
  return name;
}
read();