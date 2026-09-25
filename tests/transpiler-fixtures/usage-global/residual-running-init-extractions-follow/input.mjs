// a residual whose init RUNS code - a call, a getter, an effect inside the read - evaluates it
// before the pattern binds anything: every extraction follows that residual, which keeps its own
// prefix - on a sole or sibling declarator, in a loop head, behind an assignment, when exported
function load() { log(); return globalThis; }
class Src { static get realm() { log(); return globalThis; } }
var { from: f1, other: o1 } = load().Array;
var a = 1, { groupBy: g2, other: o2 } = Src.realm.Map;
for (var i = 0, { of: f3, other: o3 } = (log(), globalThis).Array; i < 1; i++);
for (var j = 0, { fromAsync: f8, other: o8 } = (log(), load().Array); j < 1; j++);
for (var { fromEntries: f4, other: o4 } = load().Object; !f4;) break;
var f5, t5, o5;
({ allSettled: f5, try: t5, other: o5 } = (log(), load().Promise));
export var { hasOwn: f6, other: o6 } = Src.realm.Object;
var { concat: f7, other: o7 } = load().Iterator;
