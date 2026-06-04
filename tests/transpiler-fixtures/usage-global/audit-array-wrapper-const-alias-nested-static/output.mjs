import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A const-bound nested array-wrapper alias (`[{ a: Array }]`) is followed through to resolve the
// static method's receiver, so usage-global injects the polyfill
const wrapper = [{
  a: Array
}];
const [{
  a: {
    from
  }
}] = wrapper;
from([1]);