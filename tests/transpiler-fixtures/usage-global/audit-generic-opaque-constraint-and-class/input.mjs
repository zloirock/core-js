type Opaque = { z: 1; };
declare const opaque: Opaque;
function bounded<T extends string[]>(x: T | null): T { return x as any; }
// @ts-expect-error an opaque argument the constraint does not admit is the shape under test
bounded(opaque).at(0);
