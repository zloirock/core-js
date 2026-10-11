// installs of one global, each under a presence test in a frame of its own - bundled modules each shimming it -
// decide one another: with none of them running, every test reads what the build serves, so none runs and every
// read takes the pure import. two functions, a top-level install beside one in a function, and a realm alias
// the functions share decide alike
function installMap() { if (!globalThis.Map) globalThis.Map = MapShim; }
function installMapAgain() { if (!globalThis.Map) globalThis.Map = MapShim; }
export const grouped = Map.groupBy(list, key);
if (typeof Set == 'undefined') globalThis.Set = SetShim;
function installSet() { if (typeof Set == 'undefined') globalThis.Set = SetShim; }
export const unique = new Set(list);
const realm = globalThis;
function installWeakMap() { if (!realm.WeakMap) realm.WeakMap = WeakMapShim; }
function installWeakMapAgain() { if (!realm.WeakMap) realm.WeakMap = WeakMapShim; }
export const cache = new WeakMap();
