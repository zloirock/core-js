import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// decorator factory with a rest-param signature: `function dec(...args)`. the stage-3
// decorator metadata scaffold attaches regardless of the decorator-factory function
// shape (variadic config). an unrelated polyfill in the class body (Map) confirms
// decorator detection passes through the rest-param signature
function withTags(first: string, ...rest: string[]) {
  return function (value: unknown, ctx: ClassDecoratorContext) {
    return value;
  };
}
@withTags('a', 'b', 'c')
class Tagged {
  m = new Map();
}
new Tagged();