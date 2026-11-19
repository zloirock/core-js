import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Even an empty default belongs to its hop. The neighbouring initializer runs first.
export function read(value, effect) {
  let at;
  ({
    slot: {
      at
    } = []
  } = {
    slot: value,
    other: effect()
  });
  return at;
}