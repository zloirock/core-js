import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A destructured parameter can replace a slot inside the captured array element.
// The later nested read must keep the replacement's method.
const source = [{
  w: Array
}];
function install([held]) {
  held.w = {
    from: x => x
  };
}
install(source);
const [{
  w: {
    from
  }
}] = source;
use(from([1]));