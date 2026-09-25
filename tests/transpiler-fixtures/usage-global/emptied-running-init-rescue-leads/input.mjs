// an emptied pattern over an init that RUNS code keeps what runs, ahead of the binding it fed:
// a getter read replays whole, a realm call keeps the call and any effect before it - a prefix
// of the init or of the read's own root - and several lifted effects run as one statement
function load() { log(); return globalThis; }
class Src { static get realm() { log(); return globalThis; } }
let n = 0;
let w;
var { groupBy: g1 } = Src.realm.Map;
var { of: f2 } = (log(), load().Array);
var { fromEntries: f3 } = (log(), load()).Object;
if (log) var { allSettled: f4 } = (n++, w = Src.realm.Promise);
