// a constraint is skipped for a SUPPLIED param exactly like a default (established rule
// extended to deep references); class METHOD type-params follow the same discipline; a
// class-LEVEL generic keeps legitimate omitted-arg defaults and resolvable instantiations
type Opaque = { z: 1; };
declare const opaque: Opaque;
function bounded<T extends string[]>(x: T | null): T { return x as any; }
bounded(opaque).at(0);
function widest<T extends unknown[]>(): T { return [] as any; }
widest<Opaque>().includes(1);
class C { m<T = string>(x: T | null): T { return x as any; } }
new C().m(opaque).at(0);
class Holder<T = string> { get(): T { return null as any; } }
declare const defaulted: Holder;
defaulted.get().at(0);
declare const resolved: Holder<number[]>;
resolved.get().includes(2);
