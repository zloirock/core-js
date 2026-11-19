// A for-of head destructuring call results retains the statics it reads from each possible
// constructor, including a selecting return behind a sequence prefix. The unused family
// keeps its narrow entry; usage-global injects the named statics without changing the reads.
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
