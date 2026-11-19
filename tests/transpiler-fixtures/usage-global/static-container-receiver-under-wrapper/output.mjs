import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A receiver read off a container written IN PLACE (`({ w: Array }).w`, `[Array][0]`) names a
// constructor as plainly as a binding does. The plan asked only the proxy-global resolver, which
// declines those by contract, so a peeled flat prop stayed verbatim and its leaf lost the ponyfill
// the flat twin extracts. The effect standing in the container runs ONCE either way: the hop value
// and the discard rescue harvest the same call through two spans, and only the containing one is it.
let hits = 0;
function once() {
  hits += 1;
  return {
    w: Array
  };
}
const {
  w: {
    from: nestedHop
  }
} = {
  w: {
    w: Array
  }.w
};
const [{
  from: arrayWrapped
}] = [{
  w: Array
}.w];
const {
  w: {
    from: effectful
  }
} = {
  w: once().w
};
const {
  w: {
    from: indexed
  }
} = {
  w: [Array][0]
};
export { nestedHop, arrayWrapped, effectful, indexed, hits };