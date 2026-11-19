import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The plain computed key runs once, including when the optional chain yields undefined.
function read({
  from
} = (self?.globalThis.window)[note(), 'Array']) {
  return from;
}
use(read);