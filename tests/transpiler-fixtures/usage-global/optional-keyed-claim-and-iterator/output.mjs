import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Check key and argument order across a live call, a missing method and a sealed lookup.
export function run(box, key, arg) {
  const read = box?.rows[key(), 'at'];
  const value = box?.rows[key(), 'at']?.(arg())?.toFixed(0);
  const item = box.make?.()[key(), Symbol.iterator]().next().value;
  const sealed = (box?.rows?.[key(), 'at'])(arg());
  return [read, value, item, sealed];
}