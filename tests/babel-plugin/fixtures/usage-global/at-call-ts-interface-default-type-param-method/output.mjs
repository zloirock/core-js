import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
interface Processor<T = number> {
  process(): T;
}
function foo(x: Processor) {
  x.process().toFixed(2);
}