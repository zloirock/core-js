import "core-js/modules/es.reflect.set";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// `Reflect.set` stores its VALUE into the target, so a holder handed there can be rewritten through the
// target and keeps no field narrow; the key slot only coerces the holder to a property key, which
// leaves its narrow standing
export function viaValue(target) {
  const holder = {
    items: [1, 2]
  };
  Reflect.set(target, 'k', holder);
  return holder.items.at(0);
}
export function viaKey(target) {
  const holder = {
    items: [1, 2]
  };
  Reflect.set(target, holder, 1);
  return holder.items.includes(1);
}