import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An escaping assignment follows its lexical binding and retains Map statics.
// A same-name write in a sibling function must not retain Promise.all or Promise.any.
function expose() {
  var a = {};
  a = Map;
  hand(a);
}
function sibling() {
  var a = {};
  a = Promise;
  void a.name;
}