import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// a static the module replaces runs the replacement, which may do anything with the holder it is
// handed: the registry no longer vouches for the call and the holder keeps no narrow; a static of a
// namespace the module leaves alone still vouches
Object.keys = replacement;
export function viaReplaced() {
  const holder = {
    items: [1, 2]
  };
  Object.keys(holder);
  return holder.items.at(0);
}
export function viaUntouched() {
  const holder = {
    items: [1, 2]
  };
  Reflect.ownKeys(holder);
  return holder.items.includes(1);
}