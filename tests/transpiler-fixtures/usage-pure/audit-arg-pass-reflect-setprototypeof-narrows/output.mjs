import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Reflect.setPrototypeOf(o, proto)` mirrors Object.setPrototypeOf via the Reflect API. only
// rewires [[Prototype]], leaves own properties intact - same reasoning as the Object.
// setPrototypeOf companion fixture: our property-type tracking only sees OWN slots, so
// inherited reshuffling is invisible to it. no `mutatesArgument` annotation, classifier
// returns 'trivial', narrowing on `arr` survives
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Reflect$setPrototypeOf(o, null);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();