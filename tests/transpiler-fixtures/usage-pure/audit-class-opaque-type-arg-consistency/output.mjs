import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// a class instantiated with a type-arg the resolver cannot type must treat the
// type-param-returning method as GENERIC, consistently with the interface twin and the
// directly-annotated receiver: the method body's stub return must not clobber the declared
// annotation (a null stub suppressed injection entirely; a concrete stub emitted a
// type-specific Maybe on a foreign receiver). resolvable and omitted-default
// instantiations keep their precision
type Opaque = {
  z: 1;
};
class Holder<T = string> {
  get(): T {
    return null as any;
  }
}
declare const opaqueHeld: Holder<Opaque>;
_at(_ref = opaqueHeld.get()).call(_ref, 0);
class Lister<T = string> {
  get(): T {
    return [] as any;
  }
}
declare const stubbed: Lister<Opaque>;
_includes(_ref2 = stubbed.get()).call(_ref2, 1);
declare const undeclaredHeld: Holder<Undeclared>;
_at(_ref3 = undeclaredHeld.get()).call(_ref3, 0);
interface Box<T = string> {
  get(): T;
}
declare const boxed: Box<Opaque>;
_includes(_ref4 = boxed.get()).call(_ref4, 2);
declare const resolved: Holder<number[]>;
_atMaybeArray(_ref5 = resolved.get()).call(_ref5, 0);
declare const defaulted: Holder;
_includesMaybeString(_ref6 = defaulted.get()).call(_ref6, 'd');
class Bag<T = string> {
  v: T;
  get w(): T {
    return null as any;
  }
}
declare const bag: Bag<Opaque>;
_at(_ref7 = bag.v).call(_ref7, 0);
_includes(_ref8 = bag.w).call(_ref8, 3);