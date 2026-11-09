import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A consumed field initializer preserves the source value and the nested default's static.
let allSettled;
class C {
  field = (() => {
    var _ref, _ref2;
    return _ref = undefined || _globalThis, {
      allSettled
    } = (_ref2 = _ref === _globalThis ? _Promise : _ref.Promise) === void 0 ? {} : _ref2, _ref;
  })();
}
new C();
use(allSettled);