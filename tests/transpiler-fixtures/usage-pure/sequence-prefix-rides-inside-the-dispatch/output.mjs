import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
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
at1 = _at((eff(), arr));
let flat2;
flat2 = _flatMaybeArray((eff(), o.arr));
let fm3;
fm3 = _flatMapMaybeArray((eff(), eff(), arr));
let fl4;
fl4 = _findLastMaybeArray((eff(), eff(), arr));
let inc5;
inc5 = _includes((eff(), arr));
const ts6 = _toSortedMaybeArray((eff(), arr));
use(at1, flat2, fm3, fl4, inc5, ts6);