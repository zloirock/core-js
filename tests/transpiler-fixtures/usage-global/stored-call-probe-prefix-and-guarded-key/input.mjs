// A stored call yield remains the value tested by the optional guard.
// Prefix, key and argument effects keep their source order on both branches.
const read = () => globalThis.window;
let held;
(log.push('prefix'), held = read())?.self.Array[log.push('key'), 'from']((log.push('argument'), [8]));
held;
