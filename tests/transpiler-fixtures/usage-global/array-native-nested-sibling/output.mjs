import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A native nested pattern stays before the typed method read of its sibling.
const events = [];
const item = {
  get at() {
    events.push('at');
    return () => 3;
  },
  get other() {
    events.push('other');
    return 5;
  }
};
const receiver = {
  get w() {
    events.push('w');
    return item;
  },
  y: 'abc'
};
const [{
  w: {
    at,
    other
  },
  y: {
    includes
  }
}] = [receiver, events.push('rhs')];
export { at, other, includes, events };