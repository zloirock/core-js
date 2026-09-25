import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// a sole reader over a sequence init carries the prefix inside its dispatch even where a DEFAULT wraps
// the read, and a computed key's own sequence runs once, ahead of the one read the extraction performs
const o = {
  get arr() {
    log();
    return [1, 2];
  }
};
let at1;
at1 = (_ref = _atMaybeArray((eff(), o.arr))) === void 0 ? 1 : _ref;
let flat2;
flat2 = _flatMaybeArray((eff(), o[k++, 'arr']));
use(at1, flat2);