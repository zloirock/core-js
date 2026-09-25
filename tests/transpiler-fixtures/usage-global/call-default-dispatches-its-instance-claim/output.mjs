import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.with";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/web.dom-collections.iterator";
// an instance member destructured through a CALL default (`= fa()`) dispatches on the call's value:
// the call runs once, only where the default fires - top-level, in a function, an assignment and a
// parameter - and a default the host's pairing proves dead is not replaced: the paired value is read
function fa() {
  log();
  return [1, 2];
}
const {
  A: {
    at
  } = fa()
} = {};
function h2(o) {
  const {
    A: {
      flat
    } = fa()
  } = o;
  return flat;
}
function h3(o) {
  let fm;
  ({
    A: {
      flatMap: fm
    } = fa()
  } = o);
  return fm;
}
function h4({
  findLast: fl
} = fa()) {
  return fl;
}
const {
  A: {
    with: w
  } = fa()
} = {
  A: [1, 2]
};
use(at, h2, h3, h4, w);