// a static read past a run of realm hops off an alias that MAY hold the realm (`if (c) root = globalThis`) is guarded
// on the alias itself: where it holds the realm each hop names the realm again - read ahead of the realm's own
// install too - so the identity test decides the whole run and the raw branch re-reads the run as written. only a
// realm candidate decides a run: a constructor's `.self` is no hop, so it keeps the raw read
var root;
if (c) root = globalThis;
var mixed;
if (c) mixed = globalThis;
else mixed = Map;
var ctor;
if (c) ctor = Map;
export const named = root.self.WeakSet.name;
export const deeper = root.self.globalThis.Iterator;
export const keyed = root['self'].WeakMap;
export const created = new root.self.Set();
export const resolved = root.self.Promise.resolve(1);
export const fromMixed = mixed.self.Symbol;
export const mixedStatic = mixed.self.groupBy;
export const fromCtor = ctor.self.Reflect;
globalThis.self = globalThis;
