type Opaque = { z: 1; };
declare const opaque: Opaque;
class C { m<T = string>(x: T | null): T { return x as any; } }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
new C().m(opaque).at(0);
