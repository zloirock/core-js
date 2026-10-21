import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// Each key of the default receiver uses its own pure static. Accepting the first
// key must leave the source receiver available to the remaining keys.
function read({
  of,
  from
} = (globalThis.window?.self).Array) {
  return [of(3), from([4])];
}
read();