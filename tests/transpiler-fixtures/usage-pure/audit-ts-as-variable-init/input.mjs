// variable init wrapped in TS `as` cast: the cast is peeled and the initializer
// expression rewritten in pure-mode.
const x: typeof Map = (Map as any);
