import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A realm write in a computed key invalidates later constructor inference.
class C {
  [(this.Array = Replacement, 'method')]() {}
}
Array.from('abc').at(-1);