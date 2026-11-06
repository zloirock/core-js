// A nullable realm keeps its guard while its present branch serves the constructor.
// A stored receiver preserves the same identity and throwing path.
const { Map: { prototype: map } } = globalThis.window?.self;
let saved;
const { Set: { prototype: set } } = (saved = globalThis.window?.self);
use(map, set, saved);
