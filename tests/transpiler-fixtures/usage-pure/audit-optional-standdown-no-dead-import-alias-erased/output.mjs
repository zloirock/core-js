import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A proven realm root and its optional window hop share one source of absence. A single guard covers the continuation and must not
// introduce unused imports.
const g = _globalThis;
// alias root: the bare-global alias proves like the literal - ONE window test guards the
// claim off the alias binding, the branch reads the ponyfill ctor
export const aliasErased = null == g.window ? void 0 : _Map;