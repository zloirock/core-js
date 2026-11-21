import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The tag and its substitutions run before each static read on the returned constructor.
const effects = [];
const tag = () => {
  effects.push("first");
  return Map;
};
const a = tag`x`.groupBy([1], x => x).get(1);
const tag2 = () => Array;
const b = tag2`y`.from([2]);
function pick(strings, value) {
  effects.push("pick");
  return value;
}
export const viaStatic = pick`${effects.push("argument"), Map}`.groupBy([1], x => x);
export { a, b, effects };