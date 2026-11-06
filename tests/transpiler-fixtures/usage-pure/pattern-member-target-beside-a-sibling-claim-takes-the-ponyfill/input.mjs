// a member target beside a sibling claim takes the ponyfill like the sibling does, whatever its root: the level
// mirrors whole and the pattern writes the ponyfill into the author's own slot
let S, P;
({ self: { Map: sink.m, Set: S } } = globalThis);
({ self: { Array: { from: sink.f }, Promise: P } } = globalThis);
use(S, P);
