// a nested-proxy flatten whose constructor key is a computed STRING literal (`['Array']`) must flatten
// to `const from = _Array$from` (polyfill-always-wins), not bail to a native-wins inline default. the
// computed literal key resolves to its constant name so the flatten fires, matching babel's structural
// (computed-key-agnostic) walk. a DYNAMIC computed key (`[k]`) stays bailed - it cannot be resolved
const { ['Array']: { from } } = globalThis;
from([1]);
