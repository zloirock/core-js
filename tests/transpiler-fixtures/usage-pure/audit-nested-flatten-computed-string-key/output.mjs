import _Array$from from "@core-js/pure/actual/array/from";
// a nested-proxy flatten whose constructor key is a computed STRING literal (`['Array']`) must flatten
// to `const from = _Array$from` (polyfill-always-wins), not bail to a native-wins inline default. the
// computed literal key resolves to its constant name so the flatten fires, matching babel's structural
// (computed-key-agnostic) walk. a const-bound `[k]` resolves the same way; only a runtime computed
// key (no static binding) or a side-effecting one stays bailed
const from = _Array$from;
from([1]);