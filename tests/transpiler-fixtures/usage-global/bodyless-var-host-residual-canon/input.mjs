// A bodyless var pattern evaluates its initializer before any binding, then keeps native
// and extracted reads in source order. A capture stays in the same control slot; a fully
// consumed initializer retains its effects, with no extra block scope for minted refs.
class Src { static get realm() { log(); return globalThis; } }
function load() { log(); return globalThis; }
if (c) var { allSettled: f1, other: o1 } = globalThis.Promise;
if (c) var { groupBy: f2, other: o2 } = Src.realm.Map;
if (c) var { from: f3, other: o3 } = (eff(), globalThis.Array);
while (c--) var { fromEntries: f4, other: o4 } = load().Object;
lbl: var { try: f5, other: o5 } = (n++, Src.realm.Promise);
if (c) var { withResolvers: f6 } = Src.realm.Promise;
if (c) var { sumPrecise: f7 } = (eff(), load()).Math;
if (c) var { of: f8 } = (eff(), globalThis).Array;
