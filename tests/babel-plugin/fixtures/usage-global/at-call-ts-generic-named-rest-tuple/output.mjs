import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
function wrap<T>(x: T): [first: T, ...rest: T[]] {
  return [x, x] as any;
}
for (const s of wrap('hello')) {
  s.at(0);
}