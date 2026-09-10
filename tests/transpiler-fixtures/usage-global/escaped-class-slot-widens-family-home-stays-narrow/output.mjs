import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.parse";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// a CLASS is a container like the two literals the escape walk already read: a constructor parked in
// one of its slots leaves the file with the class, so the reference owes the whole static family its
// namespace entry carries. each slot kind is a carrier of its own - a static field, a class
// expression's slot, an instance field and a private static - and a named export takes the class out
// as a call does. the last row pins the boundary: a class nothing hands out keeps the bare entry
class Registry {
  static Base = Map;
}
export { Registry };
hand(class {
  static Held = URL;
});
class Deferred {
  Later = AggregateError;
}
hand(Deferred);
class Boxed {
  static #Inner = SuppressedError;
}
hand(Boxed);
class Home {
  static Kept = Symbol;
}
use(Home.Kept('tag'));