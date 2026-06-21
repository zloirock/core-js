// single preceding overload head + non-ambient impl. exercises the impl-with-heads branch
// with exactly ONE overload head - TS retargets `typeof fn` to that head, not the impl.
// a non-ambient impl needs only one head to retarget, unlike the ambient-only path which
// needs >=2 entries (since the ambient binding itself is already one of them)
function fn(x: number): number[];
function fn(x: any): any { return null as any; }
const r: ReturnType<typeof fn> = fn(0);
r.includes(0);
