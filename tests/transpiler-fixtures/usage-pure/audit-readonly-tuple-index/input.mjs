// indexed access through a structure-preserving wrapper: `Readonly<[string[], number]>[0]`
// should resolve the tuple's first element type (string[]) so `.at(0)` picks Array helper
type Pair = Readonly<[string[], number]>;
declare const p: Pair;
const xs = p[0];
xs.at(0);
