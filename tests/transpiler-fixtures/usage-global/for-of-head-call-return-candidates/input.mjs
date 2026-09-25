// a for-of head destructuring an array of calls takes the entry of each constructor a call may
// return - a parameter default, a logical arm, several returns - while a single return that selects,
// here behind a sequence prefix, is a route the census does not follow: usage-pure binds the narrow
// entry there, and usage-global injects the static read by its key alone
const on = [1].length > 0;
let n = 0;
function withDefault(M = Map) { return M; }
function withArm(P) { return P || Promise; }
function either() { if (on) return Iterator; return Set; }
function pick() { return on ? URL : Set; }
for (const { groupBy } of [withDefault()]) groupBy([1], x => x);
for (const { try: attempt } of [withArm()]) attempt(() => 1);
for (const { from } of [either()]) from([1]);
for (const { canParse } of [(n++, pick())]) canParse('a:b');
