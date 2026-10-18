import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// a static running its callback with the `thisArg` as `this` hands the holder to that callback, which
// may rewrite its field; the source it maps over is only read element by element, and the callback
// seeing those elements is an accepted boundary, so a holder there keeps its narrow
export function viaThisArg(list, map) {
  const holder = {
    items: [1, 2]
  };
  Array.from(list, map, holder);
  return holder.items.at(0);
}
export function viaSource(map) {
  const holder = {
    items: [1, 2]
  };
  Array.from(holder, map);
  return holder.items.includes(1);
}