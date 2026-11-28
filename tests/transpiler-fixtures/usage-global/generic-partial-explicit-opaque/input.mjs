type Opaque = { z: 1; };
function partial<T = number[], U = T>(): U { return [] as any; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
partial<Opaque>().includes(1);
