// a conditionally-bound key alias does not dominate the write, so the resolver cannot prove
// WHICH member `Array[key] = ...` replaced - the receiver deopts whole and the later call
// stays on the live global (usage-pure substitutes only what it is CERTAIN about; a pristine
// ponyfill here would silently bypass the user's patch when the write does hit `from`).
// the untouched builtin next to it keeps its substitution - the deopt is per-receiver
const flag = Date.now() % 2;
if (flag) var key = "from";
Array[key] = function () { return []; };
Array.from([1, 2, 3]);
Map.groupBy([1], x => x);
