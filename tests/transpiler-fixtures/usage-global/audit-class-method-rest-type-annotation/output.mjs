import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// class method with rest-param type annotation - ClassMethod node (babel) now visited by
// the extended `checkTypeAnnotations` visitor pattern. without this entry, Promise in rest
// annotation was missed on babel while unplugin picked it up via MethodDefinition wrapping
class Batcher {
  enqueue(first: Map<string, number>, ...rest: Array<Promise<unknown>>): void {}
}