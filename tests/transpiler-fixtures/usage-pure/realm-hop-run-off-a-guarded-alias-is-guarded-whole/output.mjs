import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a static read past a run of realm hops off an alias that MAY hold the realm (`if (c) root = globalThis`) is guarded
// on the alias itself: where it holds the realm each hop names the realm again - read ahead of the realm's own
// install too - so the identity test decides the whole run and the raw branch re-reads the run as written. only a
// realm candidate decides a run: a constructor's `.self` is no hop, so it keeps the raw read
var root;
if (c) root = _globalThis;
var mixed;
if (c) mixed = _globalThis;else mixed = _Map;
var ctor;
if (c) ctor = _Map;
export const named = _nameMaybeFunction(root === _globalThis ? _WeakSet : root.self.WeakSet);
export const deeper = root === _globalThis ? _Iterator : root.self.globalThis.Iterator;
export const keyed = root === _globalThis ? _WeakMap : root['self'].WeakMap;
export const created = new (root === _globalThis ? _Set : root.self.Set)();
export const resolved = (root === _globalThis ? _Promise : root.self.Promise).resolve(1);
export const fromMixed = mixed === _globalThis ? _Symbol : mixed.self.Symbol;
export const mixedStatic = (mixed === _globalThis ? _self : mixed.self).groupBy;
export const fromCtor = ctor.self.Reflect;
_globalThis.self = _globalThis;