import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a CALL spelled inside a container-literal default (`= { B: f() }`, `= [f()]`) runs only where the
// default fires, and the static read through its value is mirrored beside it; the census keeps the
// constructor family for the value the call returns, so it is not narrowed to an entry that lacks it
function f() {
  log();
  return Map;
}
function g() {
  log();
  return Promise;
}
function h(o) {
  const {
    A: {
      B: {
        groupBy: s
      }
    } = {
      B: f()
    }
  } = o;
  const {
    P: [{
      try: t
    }] = [g()]
  } = o;
  return [s, t];
}
use(h);