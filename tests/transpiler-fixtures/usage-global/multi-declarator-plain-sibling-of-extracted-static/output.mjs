import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A plain declarator beside a static destructuring: the declaration splits around the extracted
// static, and the plain sibling's own claims keep resolving through its binding - in a function,
// at module level and in an exported declaration.
export function last(csv) {
  const parts = String(csv).split(','),
    {
      keys
    } = Object;
  return [parts.at(-1), keys(parts)];
}
export function flatten(list) {
  const copy = list,
    {
      from
    } = Array;
  return [copy.flat(), from(copy)];
}
const nested = [[1]],
  {
    of
  } = Array;
nested.flatMap(item => item);
of(1);
export const items = [1, 2],
  {
    entries
  } = Object,
  clone = items;
clone.includes(2);
entries(clone);
// an exported array wrapper: a later declarator reads the extracted leaf's binding
export let [{
    findLastIndex: lastIndexOf
  }] = [[1]],
  lastIndex = lastIndexOf;
export const one = 1,
  [{
    toSorted: sortedOf
  }] = [[1]],
  sorted = sortedOf;
export const names = [lastIndex.name, sorted.name];