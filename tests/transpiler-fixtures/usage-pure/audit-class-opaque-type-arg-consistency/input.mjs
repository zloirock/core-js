// a class instantiated with a type-arg the resolver cannot type must treat the
// type-param-returning method as GENERIC, consistently with the interface twin and the
// directly-annotated receiver: the method body's stub return must not clobber the declared
// annotation (a null stub suppressed injection entirely; a concrete stub emitted a
// type-specific Maybe on a foreign receiver)
type Opaque = { z: 1; };
class Holder<T = string> { get(): T { return null as any; } }
declare const opaqueHeld: Holder<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
opaqueHeld.get().at(0);
class Lister<T = string> { get(): T { return [] as any; } }
declare const stubbed: Lister<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
stubbed.get().includes(1);
declare const undeclaredHeld: Holder<Undeclared>;
undeclaredHeld.get().at(0);
interface Box<T = string> { get(): T; }
declare const boxed: Box<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
boxed.get().includes(2);
class Bag<T = string> { v: T; get w(): T { return null as any; } }
declare const bag: Bag<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
bag.v.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
bag.w.includes(3);
