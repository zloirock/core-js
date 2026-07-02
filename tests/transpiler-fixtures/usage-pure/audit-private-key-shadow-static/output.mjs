import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
// PrivateIdentifier (modern) for private keys. Both parsers emit `PrivateIdentifier` -
// legacy `PrivateName` is dead at parse-time. Shadow checks on `#Set` private member
// must NOT confuse the bare global Set in `new Set(...)` initializer
class C {
  #Set = new _Set([1, 2, 3]);
  upper() {
    var _ref;
    const target = this.#Set;
    return _atMaybeArray(_ref = _Array$from(target)).call(_ref, 0);
  }
}
new C();