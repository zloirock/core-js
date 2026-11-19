import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A class constructor runs its body at the matching new invocation.
// The default pattern and computed key keep their source evaluation order.
class Box {
  constructor([{
    from,
    [(effect(), 'extra')]: extra
  } = Array]) {
    use(from, extra);
  }
}
new Box([void 0]);