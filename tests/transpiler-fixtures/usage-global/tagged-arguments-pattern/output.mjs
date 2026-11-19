import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
// A named tag destructures only ownKeys from its known Reflect argument.
// Preserve the strings-array offset and inject that static without the other methods.
function tag(strings, {
  ownKeys
}) {
  return ownKeys({
    value: 1
  });
}
tag`${Reflect}`;