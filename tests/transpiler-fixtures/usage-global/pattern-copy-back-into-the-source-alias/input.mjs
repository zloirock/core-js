// an alias copied back into its source through a pattern write, the source then selected or copied forward again: the
// value the source held before - the constructor it was copied from - comes back around the ring, so the static read
// off it is served for that constructor too, beside the fallback's. a walk that stopped at an alias already on its own
// path never reached it and left the read native for that value
let held = Map;
let other = held;
let third = Object;
[held] = [other];
other = held || third;
held = flag ? third : held;
[held] = [other];
export const grouped = held.groupBy(list, key);
