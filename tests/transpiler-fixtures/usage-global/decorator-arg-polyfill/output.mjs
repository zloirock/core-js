import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.symbol.metadata";
@dec(arr.at(0))
class A {
  @dec2(arr.includes(1))
  method() {}
  @dec3(arr.flat())
  field = 1;
}