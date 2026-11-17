// A direct constructor and nested static are extracted beside object rest.
// Each binding is emitted once; consumed keys still stay excluded from rest.
const { Map, Array: { from }, ...rest } = globalThis;
use(Map, from, rest);
