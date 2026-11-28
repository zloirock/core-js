type Opaque = { z: 1; };
declare const opaque: Opaque;
function mix<T, U = number[]>(t: T | null, u: U): U { return u; }
mix(opaque, [1]).at(0);
