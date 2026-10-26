import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A rewritten outer method keeps the callback's assignments and later receiver reads.
// Each read observes its reaching value, even when successive writes change its family.
const effects = [];
const result = [[1, 2], [3, 4]].map((rows, index) => {
  rows = (effects.push(`read${index}`), index ? 'cd' : rows.slice());
  const first = rows.at(0);
  rows = (effects.push(`write${index}`), index ? [7, 8] : 'ab');
  return [first, rows.at(-1), rows.includes(index ? 8 : 'b')];
});
export { result, effects };