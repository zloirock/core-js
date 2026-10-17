import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global an alias written under a block that rebinds the name its value reads injects for the value the write saw.
let viaClosure;
{
  const Map = Object;
  viaClosure = Map;
}
export const groupedViaClosure = () => viaClosure.groupBy([1, 2], it => it % 2);