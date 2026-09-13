import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The later slot read stays as written. Global retains conservative Map injection;
// narrowing a value installed by a builtin is deferred.
const b = [];
Reflect.apply(b.push, b, [Map]);
const result = typeof b[0].groupBy;