import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A loop initializer retains the guard after the native slot before it.
// The earlier instance read keeps its own slot; global mode keeps the source form.
let M = Map;
if (flag) M = {
  name: 'user',
  at: 8,
  groupBy: 7
};
for (const {
  name: nm,
  at: other,
  groupBy: method
} = M; test();) use(nm, other, method);