import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A named array parameter consumes the supplied element or its own Array default.
// Every known call needs an extraction; custom methods retain their identity.
function read([{
  from
} = Array]) {
  return from;
}
function ownFrom(value) {
  return value;
}
read([Array])([1]);
read([Array])([2]);
read([])([3]);
read([undefined])([4]);
read([{
  from: ownFrom
}])(5);