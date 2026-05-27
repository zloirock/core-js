import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
function log(target) {
  return target;
}
@log
class Foo {
  bar() {}
}