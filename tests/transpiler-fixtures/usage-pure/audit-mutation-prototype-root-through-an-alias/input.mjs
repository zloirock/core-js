// a prototype patch names its constructor through the value canon, so the realm reached by an
// ALIAS records the same pair the bare spelling does. the key decides what the pair says: a
// readable one names the slot and leaves everything else alone, an unreadable one hides which
// member was replaced, so the whole NAME deopts and its statics stop being substituted. the
// instance reads are the negative on both - the entry is pinned up front and keeps serving
// core-js's own implementation whatever the prototype holds
const xs = [];
const g = globalThis;
g.String.prototype.at = patch;
String.raw(xs);
'ab'.at(0);

globalThis.Number.prototype[key] = patch;
Number.isFinite(1);
(1).toFixed(2);
