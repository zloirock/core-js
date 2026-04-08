import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
@dec(arr.at(0))
class A {
  @dec2(arr.at(1))
  method() {}
  @dec3(arr.at(2))
  field = 1;
}