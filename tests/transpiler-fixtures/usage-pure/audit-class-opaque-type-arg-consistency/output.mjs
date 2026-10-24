import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a class instantiated with a type-arg the resolver cannot type must treat the
// type-param-returning method as GENERIC, consistently with the interface twin and the
// directly-annotated receiver: the method body's stub return must not clobber the declared
// annotation (a null stub suppressed injection entirely; a concrete stub emitted a
// type-specific Maybe on a foreign receiver)
type Opaque = {
  z: 1;
};
class Holder<T = string> {
  get(): T {
    return null as any;
  }
}
declare const opaqueHeld: Holder<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(_ref = opaqueHeld.get()).call(_ref, 0);
class Lister<T = string> {
  get(): T {
    return [] as any;
  }
}
declare const stubbed: Lister<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_includes(_ref2 = stubbed.get()).call(_ref2, 1);
declare const undeclaredHeld: Holder<Undeclared>;
_at(_ref3 = undeclaredHeld.get()).call(_ref3, 0);
interface Box<T = string> {
  get(): T;
}
declare const boxed: Box<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_includes(_ref4 = boxed.get()).call(_ref4, 2);
class Bag<T = string> {
  v: T;
  get w(): T {
    return null as any;
  }
}
declare const bag: Bag<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(_ref5 = bag.v).call(_ref5, 0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_includes(_ref6 = bag.w).call(_ref6, 3);