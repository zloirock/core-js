import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested pattern moved onto a keyed capture over a selection reads whatever the selection
// yielded, its falsy left included: no static is read off the bare constructor there - a plain
// one goes through the identity guard or stays native, and the effectful key stays a native read.
const {
  Array: {
    [(log.push('k'), 'of')]: a,
    from: b
  }
} = cnd && {
  Array
};
const [{
  Number: {
    [(log.push('k'), 'isInteger')]: c,
    isNaN: d
  }
}] = [cnd && {
  Number
}];
use(a, b, c, d);