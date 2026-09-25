// a write lands on the container its receiver evaluates to - a sequence's tail, each arm of a
// selection, the slot a literal spelled in place reads, under a key folded past its effect prefix -
// so only that container's slot stops being trusted. a receiver nothing names (a call's result)
// unsettles the slot it writes in every container, and no other
const kept = { M: Map };
const seq = { M: Map };
(n++, seq).M = Set;
kept.M.groupBy(src, fn);
const picked = { P: Promise };
const other = {};
(flag ? picked : other).P = Set;
picked.P.try(fn);
const inPlace = { I: Iterator };
[inPlace][0].I = Set;
inPlace.I.from(src);
const folded = { U: URL };
make()[(n++, 'X')] = Set;
folded.U.canParse(src);
