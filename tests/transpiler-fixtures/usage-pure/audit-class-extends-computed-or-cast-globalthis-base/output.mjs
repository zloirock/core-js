import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// `extends` against a computed proxy-global key (`globalThis['Array']`) and a TS-cast
// expression (`(globalThis as any).Array`) both converge on the same global constructor.
// resolveGlobalName by itself bails on `node.computed`; `resolveSuperGlobalName` peels TS
// expression wrappers and accepts computed string-literal keys, then delegates to
// `globalProxyMemberName` which consults the injector's polyfill-hint side-channel to map
// the post-rewrite alias `_globalThis` back to `'globalThis'`. without this, `c.at(0)` /
// `d.includes('x')` fell through to the generic helper even though both receivers are
// statically Array subclass instances (parity with `class C extends Array {}` which
// already narrows to the array-specific variant)
class Computed extends _globalThis['Array']<string[]> {}
class Cast extends _globalThis.Array<string[]> {}
const c = new Computed();
const d = new Cast();
_atMaybeArray(c).call(c, 0);
_includesMaybeArray(d).call(d, 'x');