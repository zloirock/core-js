import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
const {
  items = []
} = config;
items.at(0);
const {
  foo: bar = []
} = obj;
bar.at(0);
const [, b = []] = arr;
b.at(0);
function fn({
  list = []
} = {}) {
  list.at(0);
}
fn();