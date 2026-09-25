import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// a sole instance claim over a sequence init READS its receiver in its own dispatch, so the prefix
// rides inside that argument on either host - a binding, a getter, two prefixes, a nested sequence,
// a statement-position sequence, a declaration - and runs exactly once
const o = {
  get arr() {
    log();
    return [1, 2];
  }
};
let at1;
({
  at: at1
} = (eff(), arr));
let flat2;
({
  flat: flat2
} = (eff(), o.arr));
let fm3;
({
  flatMap: fm3
} = (eff(), eff(), arr));
let fl4;
({
  findLast: fl4
} = (eff(), eff(), arr));
let inc5;
({
  includes: inc5
} = (eff(), arr));
const {
  toSorted: ts6
} = (eff(), arr);
use(at1, flat2, fm3, fl4, inc5, ts6);