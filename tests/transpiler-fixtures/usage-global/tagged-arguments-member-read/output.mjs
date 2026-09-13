import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
// All tag invocations supply Reflect after the strings array.
// The parameter reads only ownKeys, so the other namespace methods stay absent.
function tag(strings, namespace) {
  return namespace.ownKeys({
    value: 1
  });
}
tag`${Reflect}`;