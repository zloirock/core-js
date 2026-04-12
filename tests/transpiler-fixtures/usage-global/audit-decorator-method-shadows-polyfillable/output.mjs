import "core-js/modules/es.array.at";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
class A {
  @log
  at(i) {
    return [].at(i);
  }
}