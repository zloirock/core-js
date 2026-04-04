import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
interface BaseList extends Array<string> {}
interface DerivedList extends BaseList {}
const list: DerivedList = [];
for (const item of list) {
  item.at(0);
}