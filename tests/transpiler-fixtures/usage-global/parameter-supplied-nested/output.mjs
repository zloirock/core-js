import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A named parameter consumes a receiver inside an array and an object wrapper. The supplied
// static gets a polyfill at that source slot; a custom slot is never replaced by the first caller.
// The wrappers do not expose Array itself or require its other statics.
function read({
  slot: [{
    from
  }]
}) {
  return from;
}
read({
  slot: [Array]
})([1, 2]);
read({
  slot: [{
    from: value => value
  }]
})(3);
read({
  slot: [{}]
});