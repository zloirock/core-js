import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// destructure-default static method seen at function param position emits side-effect
// imports regardless of the array-pattern wrap
function f([{
  of
} = Array]) {
  return of(1);
}
f([Array]);