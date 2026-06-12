import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Set from "@core-js/pure/actual/set/constructor";
// every surface of a monkey-patched static routes through the injected constructor - the
// patch and all observers share one object, working even when the native global is missing
// on the target. delete, in-check, proxy-chain write and destructure all follow the write
delete _Iterator.from;
export const r1 = _Iterator.from(x);
_Map.groupBy = c1;
const { groupBy } = _Map;
export const r2 = groupBy(items, fn);
_Promise.try = c2;
export const r3 = _Promise.try(fn);
function supplier() { return Object; }
const O = supplier();
O.groupBy = c3;
export const r4 = 'groupBy' in Object;
// method-aware precision: a CLEAN key on the patched constructor keeps its receiver-less
// import; a computed static-string key routes like the dot form; a parameter shadow is not
// the global; `new` on a patched constructor uses the same injected object
export const r5 = _Iterator$zip(zs);
Array['of'] = c4;
export const r6 = Array.of(1);
function shadowed(Reflect) { Reflect.ownKeys = c5; }
export const r7 = _Reflect$ownKeys(obj);
_Map.getOrInsert = c6;
export const r8 = new _Map();
// mutation targets behind transparent wrappers route too: an optional delete (estree wraps
// the chain), an oxc-preserved paren delete and a paren compound assignment
delete _Iterator.toAsync;
delete (_Map.customParenDel);
(_Set.customParenOr) ||= parenShim;
// nested-proxy and array-wrapped destructures of a mutated key route like every other
// surface (the dispatch-side gate covers the emitters' own meta constructors too)
const { Map: { set: setAlias } } = _globalThis;
_Map.set = setPatch;
export const r9 = setAlias;
const [{ entries: entriesAlias }] = [Object];
Object.entries = entriesPatch;
export const r10 = entriesAlias;
// one pattern, mixed keys: the clean sibling still flattens, only the mutated one stays raw
const { Promise: { try: tryAlias, allSettled: asAlias } } = _globalThis;
_Promise.allSettled = asPatch;
export const r11 = [tryAlias, asAlias];