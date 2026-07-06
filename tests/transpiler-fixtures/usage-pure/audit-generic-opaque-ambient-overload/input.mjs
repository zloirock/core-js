// an AMBIENT declaration's type-param supplied with an untypeable arg must not fall to the
// declared default (the annotation-domain default-fill channel); a resolvable annotated
// arg keeps its precision
type Opaque = { z: 1; };
declare const opaque: Opaque;
declare function parse<T = string[]>(x: T | null): T;
parse(opaque).at(0);
declare const s: string;
declare function pick<T, U = number[]>(t: T, u: U): U;
pick(1, s).includes('x');
