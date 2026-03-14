import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
interface NamedItems extends Array<{
  name: string;
}> {}
const items: NamedItems = [];
for (const {
  name
} of items) {
  name.at(0);
}