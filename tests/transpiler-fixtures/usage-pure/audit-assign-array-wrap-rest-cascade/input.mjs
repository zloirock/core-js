// Array assignment captures preserve rest exclusions around a served from leaf.
// A static-only neighbouring-slot pattern retains its native of read.
let from, rest, other;
[{ from, ...rest }] = [Array];
from([1]);
rest;
[{ of: from, ...rest }, other] = [Array, 1];
from(2);
