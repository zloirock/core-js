// a mutator called with fewer arguments than it takes is legal source that throws at runtime, and
// the mutation pre-pass has to survive it: the key slot is simply EMPTY, which reads the same as a
// key it cannot resolve. one row per mutator whose key slot the pre-pass reaches
Object.defineProperty(target);
Reflect.defineProperty(target);
Reflect.deleteProperty(target);
Reflect.set(target);
export const seen = rows.at(0);
