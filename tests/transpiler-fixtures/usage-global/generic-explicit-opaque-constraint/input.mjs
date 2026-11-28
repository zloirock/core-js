type Opaque = { z: 1; };
function widest<T extends unknown[]>(): T { return [] as any; }
// @ts-expect-error an opaque argument the constraint does not admit is the shape under test
widest<Opaque>().includes(1);
