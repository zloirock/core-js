import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
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
opaqueHeld.get().at(0);
class Lister<T = string> {
  get(): T {
    return [] as any;
  }
}
declare const stubbed: Lister<Opaque>;
stubbed.get().includes(1);
declare const undeclaredHeld: Holder<Undeclared>;
undeclaredHeld.get().at(0);
interface Box<T = string> {
  get(): T;
}
declare const boxed: Box<Opaque>;
boxed.get().includes(2);
declare const resolved: Holder<number[]>;
resolved.get().at(0);
declare const defaulted: Holder;
defaulted.get().includes('d');
class Bag<T = string> {
  v: T;
  get w(): T {
    return null as any;
  }
}
declare const bag: Bag<Opaque>;
bag.v.at(0);
bag.w.includes(3);