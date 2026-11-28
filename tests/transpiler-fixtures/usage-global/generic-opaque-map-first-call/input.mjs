type Opaque = { z: 1; };
declare const opaque: Opaque;
function twice<T = string>(x: T | null): T { return x as any; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
twice(opaque).at(0);
